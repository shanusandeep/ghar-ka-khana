import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReviewForm from '@/components/ReviewForm'
import ReviewsDisplay from '@/components/ReviewsDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Star, ArrowLeft, Home } from 'lucide-react'

const Reviews = () => {
  const [activeTab, setActiveTab] = useState('view')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl text-gray-900">Ghar Ka Khana</h1>
                  <p className="text-sm text-orange-600">Customer Reviews</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
          {/* Page Content Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Read what our customers have to say about their dining experience at Ghar Ka Khana
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="view" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>View Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="submit" className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Write Review</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-6">
              <ReviewsDisplay />
            </TabsContent>

            <TabsContent value="submit" className="space-y-6">
              <div className="flex justify-center">
                <ReviewForm onSuccess={() => setActiveTab('view')} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="mt-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Loved Your Experience?</h2>
              <p className="text-lg mb-6 opacity-90">
                Share your thoughts and help others discover the authentic flavors of Ghar Ka Khana
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setActiveTab('submit')}
                className="bg-white text-orange-600 hover:bg-gray-100"
              >
                <Star className="w-5 h-5 mr-2" />
                Write a Review
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reviews
