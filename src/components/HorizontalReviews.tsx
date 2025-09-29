import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Calendar, User, Utensils } from 'lucide-react'
import { reviewsApi, Review } from '@/services/api'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import ImageModal from '@/components/ImageModal'
import ReviewPopup from '@/components/ReviewPopup'

const HorizontalReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [modalImage, setModalImage] = useState<{ url: string; name: string; ingredients?: string[]; price?: string; note?: string } | null>(null)
  const [reviewPopup, setReviewPopup] = useState<Review | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    if (reviews.length > 0) {
      startAutoScroll()
    }
  }, [reviews])

  const startAutoScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollAmount = 0
    const scrollSpeed = 1 // pixels per frame
    const scrollInterval = 30 // milliseconds

    const scroll = () => {
      if (container && !isScrolling) {
        scrollAmount += scrollSpeed
        container.scrollLeft = scrollAmount

        // Reset scroll when reaching the end
        if (scrollAmount >= container.scrollWidth - container.clientWidth) {
          scrollAmount = 0
        }
      }
    }

    const intervalId = setInterval(scroll, scrollInterval)

    // Pause scrolling on hover
    const handleMouseEnter = () => setIsScrolling(true)
    const handleMouseLeave = () => setIsScrolling(false)

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearInterval(intervalId)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewsApi.getApproved()
      setReviews(data.slice(0, 10)) // Show only first 10 reviews
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
            className={`w-3 h-3 ${
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
      return format(new Date(dateString), 'MMM dd')
    } catch {
      return dateString
    }
  }

  const getItemImage = (item: any) => {
    if (item?.image_url) return item.image_url
    
    // Fallback to category-based image mapping
    const categoryName = item?.menu_categories?.name?.toLowerCase() || ''
    const itemName = item?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "").trim() || ''
    
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

  const handleItemClick = (item: any) => {
    const imageUrl = getItemImage(item)
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
      <section className="py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="min-w-[280px] animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (error || reviews.length === 0) {
    return null // Don't show anything if no reviews
  }

  return (
    <section className="py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        <p className="text-gray-600 mt-2">Real reviews from satisfied customers</p>
      </div>
      
      <div ref={scrollContainerRef} className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {reviews.map((review) => (
          <Card key={review.id} className="min-w-[280px] max-w-[320px] hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-900 text-sm">{review.full_name}</h3>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(review.created_at)}</span>
                </div>
              </div>

              {/* Rating */}
              {renderStars(review.rating)}

              {/* Menu Items */}
              {review.review_menu_items && review.review_menu_items.length > 0 && (
                <div className="mt-3 mb-3">
                  <div className="flex items-center space-x-1 mb-2">
                    <Utensils className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-medium text-gray-700">
                      {review.review_menu_items.length} item{review.review_menu_items.length !== 1 ? 's' : ''}:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {review.review_menu_items.slice(0, 2).map((reviewMenuItem) => {
                      const item = reviewMenuItem.menu_items
                      return (
                        <div 
                          key={reviewMenuItem.id} 
                          className="flex items-center space-x-1 bg-gray-50 rounded px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          <img
                            src={getItemImage(item)}
                            alt={item.name}
                            className="w-4 h-4 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                          <span className="text-xs font-medium text-gray-900">{item.name}</span>
                        </div>
                      )
                    })}
                    {review.review_menu_items.length > 2 && (
                      <div className="text-xs text-gray-500 px-2 py-1">
                        +{review.review_menu_items.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Review Text */}
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                {review.review_text.length > 120 
                  ? `${review.review_text.substring(0, 120)}...` 
                  : review.review_text
                }
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/reviews")}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm"
        >
          View All Reviews →
        </button>
      </div>

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
    </section>
  )
}

export default HorizontalReviews
