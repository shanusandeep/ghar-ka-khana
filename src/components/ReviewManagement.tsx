import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Calendar, User, Check, X, Trash2, MessageSquare, Utensils, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { reviewsApi, Review } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import ConfirmationDialog from '@/components/ConfirmationDialog'

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [pendingReviews, setPendingReviews] = useState<Review[]>([])
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([])
  const [rejectedReviews, setRejectedReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewsApi.getAll()
      setReviews(data)
      
      // Filter reviews by status
      setPendingReviews(data.filter(review => review.status === 'pending'))
      setApprovedReviews(data.filter(review => review.status === 'approved'))
      setRejectedReviews(data.filter(review => review.status === 'rejected'))
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast({
        title: "Error loading reviews",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    if (!user?.id) return
    
    try {
      setActionLoading(reviewId)
      await reviewsApi.updateStatus(reviewId, 'approved', user.id)
      
      toast({
        title: "Review approved",
        description: "The review has been approved and is now live.",
      })
      
      await loadReviews()
    } catch (error) {
      console.error('Error approving review:', error)
      toast({
        title: "Error approving review",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (reviewId: string) => {
    if (!user?.id) return
    
    try {
      setActionLoading(reviewId)
      await reviewsApi.updateStatus(reviewId, 'rejected', user.id)
      
      toast({
        title: "Review rejected",
        description: "The review has been rejected.",
      })
      
      await loadReviews()
    } catch (error) {
      console.error('Error rejecting review:', error)
      toast({
        title: "Error rejecting review",
        description: "Failed to reject review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!selectedReview) {
      console.error('No selected review for deletion')
      return
    }
    
    console.log('Starting delete process for review:', selectedReview.id)
    
    try {
      setActionLoading(selectedReview.id)
      console.log('Calling reviewsApi.delete with ID:', selectedReview.id)
      await reviewsApi.delete(selectedReview.id)
      console.log('Delete API call successful')
      
      toast({
        title: "Review deleted",
        description: "The review has been permanently deleted.",
      })
      
      setShowDeleteDialog(false)
      setSelectedReview(null)
      await loadReviews()
      console.log('Review list reloaded')
    } catch (error) {
      console.error('Error deleting review:', error)
      toast({
        title: "Error deleting review",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const toggleReviewExpansion = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReviews(newExpanded)
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  const getItemImage = (review: Review) => {
    if (review.menu_items?.image_url) return review.menu_items.image_url
    
    // Fallback to category-based image mapping (same logic as other components)
    const categoryName = review.menu_items?.menu_categories?.name?.toLowerCase() || ''
    const itemName = review.menu_items?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "").trim() || ''
    
    const itemImageMap: { [key: string]: { [key: string]: string } } = {
      "main course": {
        "dalfry": "/food_pics/main_course/dal-fry.png",
        "dalmakhni": "/food_pics/main_course/dal-makhni.png",
        "matarpaneer": "/food_pics/main_course/matar-paneer.png",
        "paneerbhurji": "/food_pics/main_course/paneer-bhurji.png",
        "malaikofta": "/food_pics/main_course/malai-kofta.png",
        "mixveg": "/food_pics/main_course/mix-veg.png",
        "baiganbharta": "/food_pics/main_course/baigan-bharta.png",
        "eggbhurji": "/food_pics/main_course/egg-bhurji.png",
        "eggcurry": "/food_pics/main_course/egg-curry.png",
        "kadhi": "/food_pics/main_course/kadhi.png",
        "kaalachana": "/food_pics/main_course/kaala-chana.png",
        "aloomatar": "/food_pics/main_course/aloo-matar.png",
        "palakpaneer": "/food_pics/main_course/palak-paneer.png",
        "paneerbuttermasala": "/food_pics/main_course/paneer-butter-masala.png",
        "rajma": "/food_pics/main_course/Rajma.png",
        "bhindifry": "/food_pics/main_course/bhindi-fry.png",
        "kadhaichicken": "/food_pics/main_course/kadhai-chicken.png",
        "acharichicken": "/food_pics/main_course/achari-chicken.png",
        "aloogobhimasala": "/food_pics/main_course/aloo-gobhi-masala.png",
        "bharvakarela": "/food_pics/main_course/bharva-karela.png",
        "baigankalonji": "/food_pics/main_course/baigan-kalonji.png",
        "chickenchilli": "/food_pics/main_course/chicken-chilli.png",
        "vegnoodles": "/food_pics/main_course/veg-noodles.png"
      },
      "starter items": {
        "chholebhature": "/food_pics/starter/chhole-bhature.png",
        "gobimanchurian": "/food_pics/starter/gobi-manchurian.png",
        "vegnoodles": "/food_pics/starter/veg-noodles.png",
        "vegkaatiroll": "/food_pics/starter/veg-kaati-roll.png",
        "eggkaatiroll": "/food_pics/starter/egg-kaati-roll.png",
        "chickenkaatiroll": "/food_pics/starter/chicken-kaati-roll.png",
        "moongdalpakoda": "/food_pics/starter/moong-dal-pakoda.png",
        "moongdalkachori": "/food_pics/starter/moong-dal-kachori.png",
        "dahivada": "/food_pics/starter/dahi-vada.png",
        "cajunpotatoes": "/food_pics/starter/cajun-potatoes.png",
        "malaisoyachaap": "/food_pics/starter/malai-soya-chaap.png",
        "palakonionpakoda": "/food_pics/starter/palak-onion-pakoda.png",
        "pinwheelrolls": "/food_pics/starter/pinwheel-rolls.png",
        "vegcutlet": "/food_pics/starter/veg-cutlet.png",
        "vegpuff": "/food_pics/starter/veg-puff.png",
        "vegsliders": "/food_pics/starter/veg-sliders.png",
        "vadapav": "/food_pics/starter/vada-pav.png"
      },
      "breads": {
        "roti": "/food_pics/breads/roti.png",
        "naan": "/food_pics/breads/naan.png",
        "alooparatha": "/food_pics/breads/aloo-paratha.png",
        "paneerparatha": "/food_pics/breads/paneer-paratha.png",
        "gobhiparatha": "/food_pics/breads/gobhi-paratha.png",
        "onionparatha": "/food_pics/breads/onion-paratha.png",
        "sattuparatha": "/food_pics/breads/sattu-paratha.png",
        "thepla": "/food_pics/breads/thepla.png",
        "poori": "/food_pics/breads/poori.png",
        "bhatura": "/food_pics/breads/bhatura.png",
        "baati": "/food_pics/breads/Baati.png"
      },
      "rice": {
        "chickenbiryani": "/food_pics/rice/chicken-biryani.png",
        "vegbiryani": "/food_pics/rice/veg-biryani.png",
        "kathalbiryani": "/food_pics/rice/kathal-biryani.png",
        "chickenfriedrice": "/food_pics/rice/chicken-fried-rice.png",
        "eggfriedrice": "/food_pics/rice/egg-fried-rice.png",
        "vegfriedrice": "/food_pics/rice/veg-fried-rice.png",
        "navratanpulav": "/food_pics/rice/navratan-pulav.png",
        "tavapulav": "/food_pics/rice/tava-pulav.png"
      },
      "dessert": {
        "rasmalai": "/food_pics/desert/rasmalai.png",
        "gajarkahalwa": "/food_pics/desert/gajar-ka-halwa.png",
        "kalakand": "/food_pics/desert/kalakand.png",
        "moongdalhalwa": "/food_pics/desert/moong-dal-halwa.png",
        "fruitcustard": "/food_pics/desert/fruit-custard.png",
        "baklava": "/food_pics/desert/baklava.png",
        "paan": "/food_pics/desert/paan.png"
      }
    }
    
    return itemImageMap[categoryName]?.[itemName] || "/placeholder.svg"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderReviewCard = (review: Review, showActions: boolean = false, showDelete: boolean = false) => {
    const isExpanded = expandedReviews.has(review.id)
    const shouldTruncate = review.review_text.length > 150 && !isExpanded
    
    return (
          <Card key={review.id} className="hover:shadow-md transition-shadow h-64 flex flex-col">
        <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">{review.full_name}</h3>
            </div>
            {renderStars(review.rating)}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(review.status)}
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Menu Items Information */}
        {review.review_menu_items && review.review_menu_items.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Utensils className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                {review.review_menu_items.length} item{review.review_menu_items.length !== 1 ? 's' : ''}:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {review.review_menu_items.map((reviewMenuItem) => {
                const item = reviewMenuItem.menu_items
                return (
                  <div key={reviewMenuItem.id} className="flex items-center space-x-2 bg-gray-50 rounded-md px-2 py-1">
                    <img
                      src={getItemImage({ menu_items: item })}
                      alt={item.name}
                      className="w-6 h-6 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg"
                      }}
                    />
                    <span className="text-xs font-medium text-gray-900">{item.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        <div className="mb-4 flex-1 flex flex-col">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap flex-1">
            {shouldTruncate ? `${review.review_text.substring(0, 150)}...` : review.review_text}
          </p>
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReviewExpansion(review.id)}
              className="mt-2 self-start p-0 h-auto text-orange-600 hover:text-orange-700"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
          )}
        </div>

        <div className="mt-auto pt-4 border-t">
          {(showActions && review.status === 'pending') && (
            <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => handleApprove(review.id)}
              disabled={actionLoading === review.id}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading === review.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(review.id)}
              disabled={actionLoading === review.id}
            >
              {actionLoading === review.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('Delete button clicked for review:', review.id)
                setSelectedReview(review)
                setShowDeleteDialog(true)
              }}
              disabled={actionLoading === review.id}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            </div>
          )}
          {showDelete && review.status !== 'pending' && (
            <div className="flex items-center justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('Delete button clicked for review (approved/rejected):', review.id)
                setSelectedReview(review)
                setShowDeleteDialog(true)
              }}
              disabled={actionLoading === review.id}
            >
              {actionLoading === review.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
            </div>
          )}
        </div>

        {review.status !== 'pending' && review.reviewed_at && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            {review.status === 'approved' ? 'Approved' : 'Rejected'} on {formatDate(review.reviewed_at)}
          </div>
        )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Review Management</h1>
        </div>
        
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Review Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <span>Pending</span>
            <Badge variant="secondary">{pendingReviews.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <span>Approved</span>
            <Badge variant="default" className="bg-green-500">{approvedReviews.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2">
            <span>Rejected</span>
            <Badge variant="destructive">{rejectedReviews.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending Reviews</h2>
            <p className="text-sm text-gray-600">
              {pendingReviews.length} review{pendingReviews.length !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
          
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending reviews</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingReviews.map(review => renderReviewCard(review, true, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Approved Reviews</h2>
            <p className="text-sm text-gray-600">
              {approvedReviews.length} approved review{approvedReviews.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {approvedReviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Check className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No approved reviews</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedReviews.map(review => renderReviewCard(review, false, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rejected Reviews</h2>
            <p className="text-sm text-gray-600">
              {rejectedReviews.length} rejected review{rejectedReviews.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {rejectedReviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <X className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No rejected reviews</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rejectedReviews.map(review => renderReviewCard(review, false, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={(open) => setShowDeleteDialog(open)}
        onConfirm={handleDelete}
        title="Delete Review"
        description={`Are you sure you want to delete this review by ${selectedReview?.full_name}? This action cannot be undone and the review will be permanently removed from the system.`}
        confirmText="Delete"
        loading={actionLoading === selectedReview?.id}
        destructive={true}
      />
    </div>
  )
}

export default ReviewManagement
