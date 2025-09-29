import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Star, Send, CheckCircle, Utensils } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { reviewsApi } from '@/services/api'
import MultiMenuItemSelector from './MultiMenuItemSelector'

interface ReviewFormProps {
  onSuccess?: () => void
}

const ReviewForm = ({ onSuccess }: ReviewFormProps) => {
  const [fullName, setFullName] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim() || !reviewText.trim()) {
      toast({
        title: "Please fill in all required fields",
        description: "Full name and review text are required.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('Submitting review with data:', {
        full_name: fullName.trim(),
        review_text: reviewText.trim(),
        rating: rating > 0 ? rating : undefined,
        menu_item_ids: selectedMenuItemIds.length > 0 ? selectedMenuItemIds : undefined,
        status: 'pending'
      })
      
      await reviewsApi.create({
        full_name: fullName.trim(),
        review_text: reviewText.trim(),
        rating: rating > 0 ? rating : undefined,
        menu_item_ids: selectedMenuItemIds.length > 0 ? selectedMenuItemIds : undefined,
        status: 'pending'
      })

      setIsSubmitted(true)
      setFullName('')
      setReviewText('')
      setRating(0)
      setSelectedMenuItemIds([])
      
      toast({
        title: "Review submitted successfully!",
        description: "Your review is pending approval and will be published once approved by our team.",
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleRatingHover = (hoveredRating: number) => {
    setHoveredRating(hoveredRating)
  }

  const handleRatingLeave = () => {
    setHoveredRating(0)
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Thank you for your review!
          </h3>
          <p className="text-gray-600 mb-4">
            Your review has been submitted and is pending approval. It will be published once our team reviews it.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
          >
            Submit Another Review
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Share Your Experience</CardTitle>
        <p className="text-gray-600 text-center">
          We'd love to hear about your dining experience with us!
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full"
            />
          </div>

          {/* Menu Items Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Utensils className="w-4 h-4 inline mr-1" />
              Menu Items (Optional)
            </label>
            <MultiMenuItemSelector
              value={selectedMenuItemIds}
              onValueChange={setSelectedMenuItemIds}
              placeholder="Select menu items to review..."
              maxItems={5}
            />
            <p className="text-sm text-gray-500 mt-1">
              Choose specific menu items to review (up to 5), or leave blank for a general review
            </p>
          </div>

          {/* Rating (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (Optional)
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                You rated us {rating} star{rating !== 1 ? 's' : ''} out of 5
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..."
              required
              rows={5}
              className="w-full resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {reviewText.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !fullName.trim() || !reviewText.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            * Reviews are moderated and will be published after approval
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default ReviewForm
