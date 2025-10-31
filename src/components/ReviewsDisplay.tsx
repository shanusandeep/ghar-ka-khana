import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Calendar, User, Utensils, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { reviewsApi, Review } from '@/services/api'
import { format } from 'date-fns'
import ImageModal from '@/components/ImageModal'
import ReviewPopup from '@/components/ReviewPopup'

interface ReviewsDisplayProps {
  limit?: number
  showTitle?: boolean
}

const ReviewsDisplay = ({ limit, showTitle = true }: ReviewsDisplayProps) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [modalImage, setModalImage] = useState<{ url: string; name: string; ingredients?: string[]; price?: string; note?: string } | null>(null)
  const [reviewPopup, setReviewPopup] = useState<Review | null>(null)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewsApi.getApproved()
      setReviews(limit ? data.slice(0, limit) : data)
    } catch (err) {
      console.error('Error loading reviews:', err)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
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
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const getItemImage = (review: Review) => {
    if (review.menu_items?.image_url) return review.menu_items.image_url
    
    // Fallback to category-based image mapping (same logic as MenuItemSelector)
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
        "vadapav": "/food_pics/starter/vada-pav.png",
        "babycornchilli": "/food_pics/starter/babycorn-chilli.png"
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
    
    return itemImageMap[categoryName]?.[itemName] || "/images/image-coming-soon.png"
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

  const handleItemClick = (item: any) => {
    const imageUrl = getItemImage({ menu_items: item })
    const ingredients = item.ingredients ? item.ingredients.split(',').map((i: string) => i.trim()) : []
    
    // Format price information
    let price = ''
    if (item.price_per_piece && item.pieces_per_plate) {
      price = `$${item.price_per_piece} per piece`
      if (item.price_per_plate) {
        price += ` / $${item.price_per_plate} per plate`
      }
    } else {
      const prices = []
      if (item.price_per_plate) prices.push(`$${item.price_per_plate}`)
      if (item.price_half_tray) prices.push(`$${item.price_half_tray}`)
      if (item.price_full_tray) prices.push(`$${item.price_full_tray}`)
      if (prices.length > 0) {
        price = prices.join(' / ')
      }
    }

    setModalImage({
      url: imageUrl,
      name: item.name,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      price: price || undefined,
      note: item.note || undefined
    })
  }

  const closeModal = () => {
    setModalImage(null)
  }

  const openReviewPopup = (review: Review) => {
    setReviewPopup(review)
  }

  const closeReviewPopup = () => {
    setReviewPopup(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        )}
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        )}
        <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
      )}
      
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
        {reviews.map((review) => {
          const isExpanded = expandedReviews.has(review.id)
          const shouldTruncate = review.review_text.length > 150 && !isExpanded
          const hasMoreItems = review.review_menu_items && review.review_menu_items.length > 2
          const shouldShowViewDetails = shouldTruncate || hasMoreItems
          
          return (
            <Card key={review.id} className="hover:shadow-md transition-shadow h-64 flex flex-col">
              <CardContent className="p-4 flex flex-col h-full">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{review.full_name}</h3>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(review.created_at)}</span>
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
                    {review.review_menu_items.slice(0, 2).map((reviewMenuItem) => {
                      const item = reviewMenuItem.menu_items
                      return (
                        <div 
                          key={reviewMenuItem.id} 
                          className="flex items-center space-x-2 bg-gray-50 rounded-md px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          <img
                            src={getItemImage({ menu_items: item })}
                            alt={item.name}
                            className="w-6 h-6 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/image-coming-soon.png"
                              }}
                          />
                          <span className="text-xs font-medium text-gray-900">{item.name}</span>
                        </div>
                      )
                    })}
                    {hasMoreItems && (
                      <div className="text-xs text-gray-500 px-2 py-1">
                        +{review.review_menu_items.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Review Text */}
              <div className="flex-1 flex flex-col">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap flex-1">
                  {shouldTruncate ? `${review.review_text.substring(0, 150)}...` : review.review_text}
                </p>
                {shouldShowViewDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openReviewPopup(review)}
                    className="mt-2 self-start p-0 h-auto text-orange-600 hover:text-orange-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
            </Card>
          )
        })}
      </div>
      
      {limit && reviews.length === limit && (
        <div className="text-center">
          <p className="text-gray-600">
            Showing {limit} of {reviews.length} reviews
          </p>
        </div>
      )}

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          imageUrl={modalImage.url}
          imageName={modalImage.name}
          ingredients={modalImage.ingredients}
          price={modalImage.price}
          note={modalImage.note}
          onClose={closeModal}
        />
      )}

      {/* Review Popup */}
      <ReviewPopup
        isOpen={!!reviewPopup}
        review={reviewPopup}
        onClose={closeReviewPopup}
      />
    </div>
  )
}

export default ReviewsDisplay
