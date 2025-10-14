import { X, Star, Calendar, User, Utensils } from 'lucide-react'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { Review } from '@/services/api'

interface ReviewPopupProps {
  isOpen: boolean
  review: Review | null
  onClose: () => void
}

const ReviewPopup = ({ isOpen, review, onClose }: ReviewPopupProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
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
    
    return itemImageMap[categoryName]?.[itemName] || "/placeholder.svg"
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !review) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          {/* Review Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-gray-500" />
                <h3 className="text-2xl font-bold text-gray-900">{review.full_name}</h3>
              </div>
              {renderStars(review.rating)}
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Calendar className="w-5 h-5" />
              <span className="text-lg">{formatDate(review.created_at)}</span>
            </div>
          </div>

          {/* Menu Items Information */}
          {review.review_menu_items && review.review_menu_items.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-medium text-gray-700">
                  {review.review_menu_items.length} item{review.review_menu_items.length !== 1 ? 's' : ''} reviewed:
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {review.review_menu_items.map((reviewMenuItem) => {
                  const item = reviewMenuItem.menu_items
                  return (
                    <div key={reviewMenuItem.id} className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={getItemImage(item)}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900 text-center">{item.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Review Text */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Review</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
              {review.review_text}
            </p>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-center">
            <p className="text-sm text-gray-500">
              Thank you for sharing your experience with us!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewPopup
