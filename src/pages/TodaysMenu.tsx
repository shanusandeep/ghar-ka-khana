import React, { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, Star, Phone, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { GlobalSearchButton } from '@/components/GlobalSearchButton'
import PageHeader from '@/components/PageHeader'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { todaysMenuApi } from '@/services/api'
import { format } from 'date-fns'

const TodaysMenu = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [todaysMenuItems, setTodaysMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    window.scrollTo(0, 0)
    loadTodaysMenu()
  }, [])

  const loadTodaysMenu = async () => {
    try {
      setLoading(true)
      const data = await todaysMenuApi.getForDate(currentDate)
      setTodaysMenuItems(data || [])
    } catch (error) {
      console.error('Error loading today\'s menu:', error)
      // If table doesn't exist, show empty state gracefully
      setTodaysMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  // Try to resolve a specific image for a known item name when no image_url is present
  const getItemImage = (categoryName: string, itemName: string) => {
    const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

    // Map of known items to local images (served from public/)
    const itemImageMap: { [key: string]: { [key: string]: string } } = {
      "starter items": {
        [normalizeName("Chhole Bhature")]: "/food_pics/starter/chhole-bhature.png",
        [normalizeName("Chole Bhature")]: "/food_pics/starter/chhole-bhature.png",
        [normalizeName("Chana Bhature")]: "/food_pics/starter/chhole-bhature.png",
        [normalizeName("Chana Bhatura")]: "/food_pics/starter/chhole-bhature.png",
        // Gobi Manchurian variants
        [normalizeName("Gobi Manchurian")]: "/food_pics/starter/gobi-manchurian.png",
        [normalizeName("Gobhi Manchurian")]: "/food_pics/starter/gobi-manchurian.png",
        [normalizeName("Cauliflower Manchurian")]: "/food_pics/starter/gobi-manchurian.png",
        // Veg Noodles variants (and common misspellings)
        [normalizeName("Veg Noodles")]: "/food_pics/starter/veg-noodles.png",
        [normalizeName("Vegetable Noodles")]: "/food_pics/starter/veg-noodles.png",
        [normalizeName("Veg Hakka Noodles")]: "/food_pics/starter/veg-noodles.png",
        [normalizeName("Veg Noodels")]: "/food_pics/starter/veg-noodles.png",
        // Kaati/Kathi rolls
        [normalizeName("Veg Kaati Roll")]: "/food_pics/starter/veg-kaati-roll.png",
        [normalizeName("Veg Kathi Roll")]: "/food_pics/starter/veg-kaati-roll.png",
        [normalizeName("Egg Kaati Roll")]: "/food_pics/starter/egg-kaati-roll.png",
        [normalizeName("Egg Kathi Roll")]: "/food_pics/starter/egg-kaati-roll.png",
        [normalizeName("Chicken Kaati Roll")]: "/food_pics/starter/chicken-kaati-roll.png",
        [normalizeName("Chicken Kathi Roll")]: "/food_pics/starter/chicken-kaati-roll.png",
        // Pakodas
        [normalizeName("Moong Dal Pakoda")]: "/food_pics/starter/moong-dal-pakoda.png",
        [normalizeName("Mung Dal Pakoda")]: "/food_pics/starter/moong-dal-pakoda.png",
        [normalizeName("Moong Daal Pakoda")]: "/food_pics/starter/moong-dal-pakoda.png",
        [normalizeName("Palak Onion Pakoda")]: "/food_pics/starter/palak-onion-pakoda.png",
        [normalizeName("Spinach Onion Pakoda")]: "/food_pics/starter/palak-onion-pakoda.png",
        // Soya Chaap variants
        [normalizeName("Soya Chaap")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Soya Chaap Malai")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Malai Soya Chaap")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Soya Chaap Malai Tikka")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Soya Chaap Tikka")]: "/food_pics/starter/malai-soya-chaap.png",
        [normalizeName("Soya Chaaap")]: "/food_pics/starter/malai-soya-chaap.png",
        // Veg Sliders variants
        [normalizeName("Veg Sliders")]: "/food_pics/starter/veg-sliders.png",
        [normalizeName("Vegetable Sliders")]: "/food_pics/starter/veg-sliders.png",
        [normalizeName("Veg Slider")]: "/food_pics/starter/veg-sliders.png",
        // Dahi Vada variants
        [normalizeName("Dahi Vada")]: "/food_pics/starter/dahi-vada.png",
        [normalizeName("Dahi Wada")]: "/food_pics/starter/dahi-vada.png",
        [normalizeName("Dahi Bhalla")]: "/food_pics/starter/dahi-vada.png",
        [normalizeName("Dahi Vade")]: "/food_pics/starter/dahi-vada.png",
        // Moong Dal Kachori variants
        [normalizeName("Moong Dal Kachori")]: "/food_pics/starter/moong-dal-kachori.png",
        [normalizeName("Mung Dal Kachori")]: "/food_pics/starter/moong-dal-kachori.png",
        [normalizeName("Moong Daal Kachori")]: "/food_pics/starter/moong-dal-kachori.png",
        [normalizeName("Dal Kachori")]: "/food_pics/starter/moong-dal-kachori.png",
        // Veg Cutlet variants
        [normalizeName("Veg Cutlet")]: "/food_pics/starter/veg-cutlet.png",
        [normalizeName("Vegetable Cutlet")]: "/food_pics/starter/veg-cutlet.png",
        [normalizeName("Veg Cutlets")]: "/food_pics/starter/veg-cutlet.png",
        // Cajun Potatoes variants
        [normalizeName("Cajun Potatoes")]: "/food_pics/starter/cajun-potatoes.png",
        [normalizeName("Cajun Potato")]: "/food_pics/starter/cajun-potatoes.png",
        // Pinwheel Rolls variants
        [normalizeName("Pinwheel Rolls")]: "/food_pics/starter/pinwheel-rolls.png",
        [normalizeName("Pinwheel Roll")]: "/food_pics/starter/pinwheel-rolls.png",
        // Veg Puff variants
        [normalizeName("Veg Puff")]: "/food_pics/starter/veg-puff.png",
        [normalizeName("Vegetable Puff")]: "/food_pics/starter/veg-puff.png",
        [normalizeName("Veg Puffs")]: "/food_pics/starter/veg-puff.png",
        // Babycorn Chilli variants
        [normalizeName("Babycorn Chilli")]: "/food_pics/starter/babycorn-chilli.png",
        [normalizeName("Baby Corn Chilli")]: "/food_pics/starter/babycorn-chilli.png",
        [normalizeName("Babycorn Chili")]: "/food_pics/starter/babycorn-chilli.png",
        [normalizeName("Baby Corn Chili")]: "/food_pics/starter/babycorn-chilli.png",
        // Fish Fry variants
        [normalizeName("Fish Fry")]: "/food_pics/starter/fish-fry.png",
        // Momo variants
        [normalizeName("Veg Momos")]: "/food_pics/starter/veg-momos.png",
        [normalizeName("Veg Momo")]: "/food_pics/starter/veg-momos.png",
        [normalizeName("Vegetable Momos")]: "/food_pics/starter/veg-momos.png",
        [normalizeName("Fried Veg Momos")]: "/food_pics/starter/fried-veg-momos.png",
        [normalizeName("Fried Veg Momo")]: "/food_pics/starter/fried-veg-momos.png",
        [normalizeName("Chicken Momos")]: "/food_pics/starter/chicken-momos.png",
        [normalizeName("Chicken Momo")]: "/food_pics/starter/chicken-momos.png",
        [normalizeName("Fried Chicken Momos")]: "/food_pics/starter/fried-chicken-momos.png",
        [normalizeName("Fried Chicken Momo")]: "/food_pics/starter/fried-chicken-momos.png",
        // Aloo Chat variants
        [normalizeName("Aloo Chat")]: "/food_pics/starter/aloo-chat.png",
        [normalizeName("Aloo Chaat")]: "/food_pics/starter/aloo-chat.png",
        [normalizeName("Alu Chat")]: "/food_pics/starter/aloo-chat.png",
        [normalizeName("Alu Chaat")]: "/food_pics/starter/aloo-chat.png",
        // Vada Pav variants
        [normalizeName("Vada Pav")]: "/food_pics/starter/vada-pav.png"
      },
      "breads": {
        [normalizeName("Aloo Paratha")]: "/food_pics/breads/aloo-paratha.png",
        [normalizeName("Aloo Paratha Plate")]: "/food_pics/breads/aloo-paratha.png",
        [normalizeName("Poori")]: "/food_pics/breads/poori.png",
        [normalizeName("Puri")]: "/food_pics/breads/poori.png",
        [normalizeName("Gobhi Paratha")]: "/food_pics/breads/gobhi-paratha.png",
        [normalizeName("Gobi Paratha")]: "/food_pics/breads/gobhi-paratha.png",
        [normalizeName("Roti")]: "/food_pics/breads/roti.png",
        [normalizeName("Chapati")]: "/food_pics/breads/roti.png",
        [normalizeName("Paneer Paratha")]: "/food_pics/breads/paneer-paratha.png",
        [normalizeName("Onion Paratha")]: "/food_pics/breads/onion-paratha.png",
        [normalizeName("Thepla")]: "/food_pics/breads/thepla.png",
        [normalizeName("Methi Thepla")]: "/food_pics/breads/thepla.png",
        [normalizeName("Plain Paratha")]: "/food_pics/breads/plain-paratha.png",
        [normalizeName("Bhatura")]: "/food_pics/breads/bhatura.png",
        [normalizeName("Bhature")]: "/food_pics/breads/bhatura.png",
        [normalizeName("Baati")]: "/food_pics/breads/Baati.png",
        // Sattu Paratha variants
        [normalizeName("Sattu Paratha")]: "/food_pics/breads/sattu-paratha.png",
        [normalizeName("Sattu Ka Paratha")]: "/food_pics/breads/sattu-paratha.png",
        [normalizeName("Satu Paratha")]: "/food_pics/breads/sattu-paratha.png"
      },
      "dessert": {
        [normalizeName("Moong Dal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        [normalizeName("Mung Dal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        [normalizeName("Moong Daal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        // Gajar Ka Halwa variants
        [normalizeName("Gajar ka Halwa")]: "/food_pics/desert/gajar-ka-halwa.png",
        [normalizeName("Gajar Ka Halwa")]: "/food_pics/desert/gajar-ka-halwa.png",
        [normalizeName("Gajar Ka Halva")]: "/food_pics/desert/gajar-ka-halwa.png",
        [normalizeName("Carrot Halwa")]: "/food_pics/desert/gajar-ka-halwa.png",
        // Rasmalai variants
        [normalizeName("Rasmalai")]: "/food_pics/desert/rasmalai.png",
        [normalizeName("Ras Malai")]: "/food_pics/desert/rasmalai.png",
        // Kalakand variants
        [normalizeName("Kalakand")]: "/food_pics/desert/kalakand.png",
        [normalizeName("Kala Kand")]: "/food_pics/desert/kalakand.png",
        [normalizeName("Kalakhand")]: "/food_pics/desert/kalakand.png",
        // Gulab Jamun variants
        [normalizeName("Gulab Jamun")]: "/food_pics/desert/gulab-jamun.png",
        [normalizeName("Gulab Jamoon")]: "/food_pics/desert/gulab-jamun.png",
        [normalizeName("Gulabjamun")]: "/food_pics/desert/gulab-jamun.png",
        [normalizeName("Gulab Jaman")]: "/food_pics/desert/gulab-jamun.png",
        // Baklava variants
        [normalizeName("Baklava")]: "/food_pics/desert/baklava.png",
        [normalizeName("Baklawa")]: "/food_pics/desert/baklava.png",
        // Paan variants
        [normalizeName("Paan")]: "/food_pics/desert/paan.png",
        [normalizeName("Betel Paan")]: "/food_pics/desert/paan.png",
        [normalizeName("Sweet Paan")]: "/food_pics/desert/paan.png",
        [normalizeName("Meetha Paan")]: "/food_pics/desert/paan.png",
        // Fruit Custard variants
        [normalizeName("Fruit Custard")]: "/food_pics/desert/fruit-custard.png",
        [normalizeName("Fruit Custurd")]: "/food_pics/desert/fruit-custard.png",
        [normalizeName("Mixed Fruit Custard")]: "/food_pics/desert/fruit-custard.png"
      },
      "rice": {
        [normalizeName("Tava Pulav")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Tawa Pulav")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Tawa Pulao")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Veg Fried Rice")]: "/food_pics/rice/veg-fried-rice.png",
        [normalizeName("Vegetable Fried Rice")]: "/food_pics/rice/veg-fried-rice.png",
        [normalizeName("Chicken Fried Rice")]: "/food_pics/rice/chicken-fried-rice.png",
        [normalizeName("Kathal Biryani")]: "/food_pics/rice/kathal-biryani.png",
        [normalizeName("Jackfruit Biryani")]: "/food_pics/rice/kathal-biryani.png",
        [normalizeName("Navratan Pulav")]: "/food_pics/rice/navratan-pulav.png",
        [normalizeName("Navratna Pulav")]: "/food_pics/rice/navratan-pulav.png",
        [normalizeName("Navratan Pulao")]: "/food_pics/rice/navratan-pulav.png",
        [normalizeName("Egg Fried Rice")]: "/food_pics/rice/egg-fried-rice.png",
        [normalizeName("Anda Fried Rice")]: "/food_pics/rice/egg-fried-rice.png",
        // Chicken Biryani variants
        [normalizeName("Chicken Biryani")]: "/food_pics/rice/chicken-biryani.png",
        [normalizeName("Chicken Biriyani")]: "/food_pics/rice/chicken-biryani.png",
        [normalizeName("Chicken Dum Biryani")]: "/food_pics/rice/chicken-biryani.png",
        // Veg Biryani variants
        [normalizeName("Veg Biryani")]: "/food_pics/rice/veg-biryani.png",
        [normalizeName("Vegetable Biryani")]: "/food_pics/rice/veg-biryani.png",
        [normalizeName("Veg Biriyani")]: "/food_pics/rice/veg-biryani.png",
        [normalizeName("Vegetable Biriyani")]: "/food_pics/rice/veg-biryani.png"
      },
      "main course": {
        [normalizeName("Chhole Bhature")]: "/food_pics/main_course/chhole-bhature.jpg",
        [normalizeName("Chole Bhature")]: "/food_pics/main_course/chhole-bhature.jpg",
        [normalizeName("Chana Bhature")]: "/food_pics/main_course/chhole-bhature.jpg",
        [normalizeName("Chana Bhatura")]: "/food_pics/main_course/chhole-bhature.jpg",
        [normalizeName("Bharva Karela")]: "/food_pics/main_course/bharva-karela.png",
        [normalizeName("Bharwan Karela")]: "/food_pics/main_course/bharva-karela.png",
        [normalizeName("Stuffed Karela")]: "/food_pics/main_course/bharva-karela.png",
        [normalizeName("Dal Fry")]: "/food_pics/main_course/dal-fry.png",
        [normalizeName("Dal Tadka")]: "/food_pics/main_course/dal-fry.png",
        [normalizeName("Dal Makhni")]: "/food_pics/main_course/dal-makhni.png",
        [normalizeName("Dal Makhani")]: "/food_pics/main_course/dal-makhni.png",
        [normalizeName("Mix Veg")]: "/food_pics/main_course/mix-veg.png",
        [normalizeName("Mixed Veg")]: "/food_pics/main_course/mix-veg.png",
        [normalizeName("Mixed Vegetable")]: "/food_pics/main_course/mix-veg.png",
        [normalizeName("Malai Kofta")]: "/food_pics/main_course/malai-kofta.png",
        [normalizeName("Paneer Bhurji")]: "/food_pics/main_course/paneer-bhurji.png",
        // New additions
        [normalizeName("Egg Bhurji")]: "/food_pics/main_course/egg-bhurji.png",
        [normalizeName("Anda Bhurji")]: "/food_pics/main_course/egg-bhurji.png",
        [normalizeName("Matar Paneer")]: "/food_pics/main_course/matar-paneer.png",
        [normalizeName("Mattar Paneer")]: "/food_pics/main_course/matar-paneer.png",
        [normalizeName("Mutter Paneer")]: "/food_pics/main_course/matar-paneer.png",
        [normalizeName("Peas Paneer")]: "/food_pics/main_course/matar-paneer.png",
        // Baingan/Baigan Bharta
        [normalizeName("Baigan Bharta")]: "/food_pics/main_course/baigan-bharta.png",
        [normalizeName("Baingan Bharta")]: "/food_pics/main_course/baigan-bharta.png",
        // New additions - Kadhi, Kaala Chana, Aloo Matar
        [normalizeName("Kadhi")]: "/food_pics/main_course/kadhi.png",
        [normalizeName("Kaala Chana")]: "/food_pics/main_course/kaala-chana.png",
        [normalizeName("Kala Chana")]: "/food_pics/main_course/kaala-chana.png",
        [normalizeName("Black Chana")]: "/food_pics/main_course/kaala-chana.png",
        [normalizeName("Aloo Matar")]: "/food_pics/main_course/aloo-matar.png",
        [normalizeName("Aloo Mattar")]: "/food_pics/main_course/aloo-matar.png",
        [normalizeName("Potato Peas")]: "/food_pics/main_course/aloo-matar.png",
        [normalizeName("Eggplant Bharta")]: "/food_pics/main_course/baigan-bharta.png",
        // Egg Curry
        [normalizeName("Egg Curry")]: "/food_pics/main_course/egg-curry.png",
        [normalizeName("Anda Curry")]: "/food_pics/main_course/egg-curry.png",
        // Baigan/Baingan Kalonji
        [normalizeName("Baigan Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        [normalizeName("Baingan Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        [normalizeName("Eggplant Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        // Palak Paneer variants
        [normalizeName("Palak Paneer")]: "/food_pics/main_course/palak-paneer.png",
        [normalizeName("Saag Paneer")]: "/food_pics/main_course/palak-paneer.png",
        [normalizeName("Spinach Paneer")]: "/food_pics/main_course/palak-paneer.png",
        // Achari Chicken
        [normalizeName("Achari Chicken")]: "/food_pics/main_course/achari-chicken.png",
        // Bhindi Fry
        [normalizeName("Bhindi Fry")]: "/food_pics/main_course/bhindi-fry.png",
        [normalizeName("Okra Fry")]: "/food_pics/main_course/bhindi-fry.png",
        // Kadhai/Kadai/Karahi Chicken variants
        [normalizeName("Kadhai Chicken")]: "/food_pics/main_course/kadhai-chicken.png",
        [normalizeName("Kadai Chicken")]: "/food_pics/main_course/kadhai-chicken.png",
        [normalizeName("Karahi Chicken")]: "/food_pics/main_course/kadhai-chicken.png",
        [normalizeName("Chicken Kadhai")]: "/food_pics/main_course/kadhai-chicken.png",
        // Aloo Gobi/Gobhi Masala variants
        [normalizeName("Aloo Gobi Masala")]: "/food_pics/main_course/aloo-gobhi-masala.png",
        [normalizeName("Aloo Gobhi Masala")]: "/food_pics/main_course/aloo-gobhi-masala.png",
        [normalizeName("Aloo Gobi")]: "/food_pics/main_course/aloo-gobhi-masala.png",
        [normalizeName("Aloo Gobhi")]: "/food_pics/main_course/aloo-gobhi-masala.png",
        // Paneer Butter Masala variants
        [normalizeName("Paneer Butter Masala")]: "/food_pics/main_course/paneer-butter-masala.png",
        [normalizeName("Paneer Makhani")]: "/food_pics/main_course/paneer-butter-masala.png",
        [normalizeName("Butter Paneer")]: "/food_pics/main_course/paneer-butter-masala.png",
        // Rajma variants
        [normalizeName("Rajma")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Rajmah")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Kidney Beans")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Red Kidney Beans")]: "/food_pics/main_course/Rajma.png",
        // Butter Chicken variants
        [normalizeName("Butter Chicken")]: "/food_pics/main_course/butter-chicken.png",
        [normalizeName("Butter Chiken")]: "/food_pics/main_course/butter-chicken.png",
        // Mutton Roganjosh variants
        [normalizeName("Mutton Roganjosh")]: "/food_pics/main_course/mutton-roganjosh.png",
        [normalizeName("Mutton Rogan Josh")]: "/food_pics/main_course/mutton-roganjosh.png",
        [normalizeName("Mutton Rogan Gosh")]: "/food_pics/main_course/mutton-roganjosh.png"
      }
    };

    const normalizedCategory = categoryName.toLowerCase();
    const normalizedItemName = normalizeName(itemName);
    
    return itemImageMap[normalizedCategory]?.[normalizedItemName] || null;
  };

  const getDefaultImage = (categoryName: string) => {
    return "/images/image-coming-soon.png";
  }

  const getItemImageSrc = (item: any) => {
    const categoryName = item.menu_items?.menu_categories?.name || 'Unknown Category';
    
    // First try the database image_url
    if (item.menu_items?.image_url) {
      return item.menu_items.image_url;
    }
    
    // Then try to find a specific local image for this item
    const localImage = getItemImage(categoryName, item.menu_items?.name || '');
    if (localImage) {
      return localImage;
    }
    
    // Finally fallback to category default
    return getDefaultImage(categoryName);
  }

  const formatPrice = (item: any) => {
    const menuItem = item.menu_items;
    if (!menuItem) return "Price not available";

    const prices = [];
    
    if (menuItem.price_per_piece && menuItem.pieces_per_plate) {
      prices.push(`$${menuItem.price_per_piece} per piece`);
      if (menuItem.price_per_plate) {
        prices.push(`$${menuItem.price_per_plate} per plate`);
      }
    } else {
      if (menuItem.price_per_plate) prices.push(`$${menuItem.price_per_plate}`);
      if (menuItem.price_half_tray) prices.push(`$${menuItem.price_half_tray}`);
      if (menuItem.price_full_tray) prices.push(`$${menuItem.price_full_tray}`);
    }
    
    if (prices.length === 0) return "Price not set";
    if (prices.length === 1) return prices[0];
    return prices.join(" / ");
  };

  // Group items by category
  const groupedItems = todaysMenuItems.reduce((acc: any, item) => {
    const categoryName = item.menu_items?.menu_categories?.name || 'Other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <PageHeader 
        title="Today's Menu"
        subtitle={format(new Date(), 'EEEE, MMM dd, yyyy')}
        showBackButton={true}
        backTo="/"
        activeSection="todays-menu"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading today's special menu...</p>
          </div>
        ) : todaysMenuItems.length === 0 ? (
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="text-center py-8 px-4">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-3">No Special Menu Today</h2>
                <p className="text-gray-600 mb-6 text-sm">
                  We don't have a special menu available for pickup today. Please check our regular menu categories.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate("/")}
                    className="w-full"
                    size="lg"
                  >
                    View Full Menu
                  </Button>
                  <Button
                    onClick={() => window.open("https://wa.me/12017131850", "_blank")}
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                    size="lg"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">


            {/* Menu Items by Category */}
            {Object.entries(groupedItems).map(([categoryName, items]: [string, any]) => (
              <div key={categoryName}>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 sm:h-8 bg-orange-500 rounded-full"></div>
                  {categoryName}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </Badge>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {items.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square relative">
                        <img
                          src={getItemImageSrc(item)}
                          alt={item.menu_items?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getDefaultImage(item.menu_items?.menu_categories?.name || 'Main Course');
                          }}
                        />
                        {item.special_note && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-500 text-white">
                              Special
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {item.menu_items?.name}
                        </h4>
                        
                        {item.menu_items?.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.menu_items.description}
                          </p>
                        )}

                        {item.special_note && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-xs text-yellow-800 font-medium">Today's Special:</p>
                            <p className="text-sm text-yellow-700">{item.special_note}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="font-bold text-green-600">
                            {formatPrice(item)}
                          </p>
                          <Button 
                            size="sm"
                            onClick={() => window.open("https://wa.me/12017131850", "_blank")}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {/* Ready to Order Section - Moved to bottom */}
            <div className="text-center mt-8 sm:mt-12">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                  <h2 className="text-lg sm:text-xl font-bold">Ready to Order?</h2>
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                </div>
                <p className="mb-4 opacity-90 text-sm sm:text-base">
                  Call or WhatsApp us to place your order for pickup today!
                </p>
                <Button
                  onClick={() => window.open("https://wa.me/12017131850", "_blank")}
                  variant="secondary"
                  className="bg-white text-orange-600 hover:bg-orange-50 w-full sm:w-auto"
                  size="lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Order via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-orange-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            For orders and inquiries, contact us at{' '}
            <a href="tel:+12017131850" className="text-orange-600 font-medium hover:underline">
              (201) 713-1850
            </a>
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </div>
  )
}

export default TodaysMenu
