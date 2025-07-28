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
      const data = await menuItemsApi.getByCategoryName(categoryName);
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
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
      image: item.image_url || getDefaultImage(categoryName),
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