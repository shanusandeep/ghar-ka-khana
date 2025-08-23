import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MenuSection from "@/components/MenuSection";
import { menuItemsApi } from "@/services/api";
import { MenuItem } from "@/config/supabase";
import { useToast } from "@/hooks/use-toast";

interface CategoryPageProps {
  categoryName: string;
  bgGradient?: string;
}

const CategoryPage = ({ categoryName, bgGradient = "from-orange-50 to-amber-50" }: CategoryPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadMenuItems();
  }, [categoryName]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      console.log('🔍 CategoryPage: Looking for category name:', categoryName);
      const data = await menuItemsApi.getByCategoryName(categoryName);
      console.log('📊 CategoryPage: Found items:', data);
      setMenuItems(data);
    } catch (error) {
      console.error('❌ Error loading menu items:', error);
      toast({
        title: "Error",
        description: `Failed to load ${categoryName} items`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Convert database items to the format expected by MenuSection
  const formatItemsForDisplay = (items: MenuItem[]) => {
    return items.map(item => ({
      name: item.name,
      price: formatPrice(item),
      note: formatNote(item),
      image: item.image_url || getItemImage(categoryName, item.name) || getDefaultImage(categoryName),
      ingredients: item.ingredients || [],
      description: item.description
    }));
  };

  const formatPrice = (item: MenuItem) => {
    const prices = [];
    
    // Handle piece-based pricing for breads
    if (item.price_per_piece && item.pieces_per_plate) {
      prices.push(`$${item.price_per_piece} per piece`);
      if (item.price_per_plate) {
        prices.push(`$${item.price_per_plate} per plate`);
      }
    } else {
      // Handle regular pricing
      if (item.price_per_plate) prices.push(`$${item.price_per_plate}`);
      if (item.price_half_tray) prices.push(`$${item.price_half_tray}`);
      if (item.price_full_tray) prices.push(`$${item.price_full_tray}`);
    }
    
    if (prices.length === 0) return "Price not set";
    if (prices.length === 1) return prices[0];
    return prices.join(" / ");
  };

  const formatNote = (item: MenuItem) => {
    const notes = [];
    
    // Handle piece-based pricing notes for breads
    if (item.price_per_piece && item.pieces_per_plate && item.min_piece_order) {
      notes.push(`${item.pieces_per_plate} pieces per plate`);
      notes.push(`Minimum ${item.min_piece_order} pieces`);
    } else {
      // Handle regular notes
      if (item.price_per_plate) notes.push("Plate");
      if (item.price_half_tray) notes.push("Half tray");
      if (item.price_full_tray) notes.push("Full tray");
    }
    
    return notes.join(" | ");
  };

  const getDefaultImage = (category: string) => {
    const defaultImages: { [key: string]: string } = {
      "Starter Items": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "Main Course": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "Breads": "https://images.unsplash.com/photo-1574653853027-5a3d8c4e8a8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "Rice": "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "Dessert": "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    };
    return defaultImages[category] || defaultImages["Main Course"];
  };

  // Try to resolve a specific image for a known item name when no image_url is present
  const getItemImage = (category: string, itemName: string) => {
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
        [normalizeName("Veg Slider")]: "/food_pics/starter/veg-sliders.png"
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
        [normalizeName("Baati")]: "/food_pics/breads/Baati.png"
      },
      "dessert": {
        [normalizeName("Moong Dal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        [normalizeName("Mung Dal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        [normalizeName("Moong Daal Halwa")]: "/food_pics/desert/moong-dal-halwa.png",
        // Rasmalai variants
        [normalizeName("Rasmalai")]: "/food_pics/desert/rasmalai.png",
        [normalizeName("Ras Malai")]: "/food_pics/desert/rasmalai.png"
      },
      "rice": {
        [normalizeName("Tava Pulav")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Tawa Pulav")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Tawa Pulao")]: "/food_pics/rice/tava-pulav.png",
        [normalizeName("Veg Fried Rice")]: "/food_pics/rice/veg-fried-rice.png",
        [normalizeName("Vegetable Fried Rice")]: "/food_pics/rice/veg-fried-rice.png",
        [normalizeName("Chicken Fried Rice")]: "/food_pics/rice/Chicken Fried Rice.png",
        [normalizeName("Kathal Biryani")]: "/food_pics/rice/Kathal Biryani.png",
        [normalizeName("Jackfruit Biryani")]: "/food_pics/rice/Kathal Biryani.png",
        [normalizeName("Navratan Pulav")]: "/food_pics/rice/Navratan Pulav.png",
        [normalizeName("Navratna Pulav")]: "/food_pics/rice/Navratan Pulav.png",
        [normalizeName("Navratan Pulao")]: "/food_pics/rice/Navratan Pulav.png",
        [normalizeName("Egg Fried Rice")]: "/food_pics/rice/Egg Fried Rice.png",
        [normalizeName("Anda Fried Rice")]: "/food_pics/rice/Egg Fried Rice.png"
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
        // Baingan/Baigan Bharta (file name uses a space; path reflects exact name)
        [normalizeName("Baigan Bharta")]: "/food_pics/main_course/baigan bharta.png",
        [normalizeName("Baingan Bharta")]: "/food_pics/main_course/baigan bharta.png",
        [normalizeName("Eggplant Bharta")]: "/food_pics/main_course/baigan bharta.png"
        ,
        // Egg Curry
        [normalizeName("Egg Curry")]: "/food_pics/main_course/egg-curry.png",
        [normalizeName("Anda Curry")]: "/food_pics/main_course/egg-curry.png"
        ,
        // Baigan/Baingan Kalonji
        [normalizeName("Baigan Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        [normalizeName("Baingan Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        [normalizeName("Eggplant Kalonji")]: "/food_pics/main_course/baigan-kalonji.png",
        // Palak Paneer variants
        [normalizeName("Palak Paneer")]: "/food_pics/main_course/palak-paneer.png",
        [normalizeName("Saag Paneer")]: "/food_pics/main_course/palak-paneer.png",
        [normalizeName("Spinach Paneer")]: "/food_pics/main_course/palak-paneer.png"
        ,
        // Achari Chicken (in case this dish appears in main course category)
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
        [normalizeName("Paneer Butter Masala")]: "/food_pics/main_course/Paneer Butter Masala.png",
        [normalizeName("Paneer Makhani")]: "/food_pics/main_course/Paneer Butter Masala.png",
        [normalizeName("Butter Paneer")]: "/food_pics/main_course/Paneer Butter Masala.png",
        // Rajma variants
        [normalizeName("Rajma")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Rajmah")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Kidney Beans")]: "/food_pics/main_course/Rajma.png",
        [normalizeName("Red Kidney Beans")]: "/food_pics/main_course/Rajma.png"
      }
    };

    const normalizedCategory = category.toLowerCase();
    const normalizedItem = normalizeName(itemName);

    const categoryMap = itemImageMap[normalizedCategory];
    if (!categoryMap) return undefined;
    const directMatch = categoryMap[normalizedItem];
    if (directMatch) return directMatch;

    // Heuristic fallbacks for common naming variations
    if (normalizedCategory === "starter items") {
      // Moong/Mung Dal Pakoda/Pakora (singular/plural/spelling variants)
      const isMoongDalPakoda =
        (normalizedItem.includes("moong") || normalizedItem.includes("mung")) &&
        (normalizedItem.includes("pakod") || normalizedItem.includes("pakor") || normalizedItem.includes("pak"));
      if (isMoongDalPakoda) return "/food_pics/starter/moong-dal-pakoda.png";
    }
    
    return undefined;
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading {categoryName}...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600 mb-4">
              No items available in {categoryName} category
            </div>
            <p className="text-sm text-gray-500">
              Items may be temporarily unavailable or this category needs to be populated.
            </p>
          </div>
        ) : (
          <MenuSection 
            category={categoryName} 
            items={formatItemsForDisplay(menuItems)} 
          />
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 