
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MenuSection from "@/components/MenuSection";

const Breads = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const breadItems = [
    { 
      name: "Roti/Poori", 
      price: "$1", 
      note: "2 pieces | Minimum 30 pieces",
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Whole wheat flour", "Water", "Salt", "Oil (for poori)", "Ghee (optional)"]
    },
    { 
      name: "Plain Paratha", 
      price: "$1", 
      note: "Per piece | Minimum 20 pieces",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Whole wheat flour", "Water", "Salt", "Oil", "Ghee"]
    },
    { 
      name: "Stuffed Paratha (Aloo/Gobi/Paneer/Chinese)", 
      price: "$2", 
      note: "Per piece | Minimum 10 pieces",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Whole wheat flour", "Filling (potato/cauliflower/paneer/vegetables)", "Onions", "Garlic", "Ginger", "Green chilies", "Spices", "Coriander leaves", "Oil", "Ghee", "Salt"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
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
        
        <MenuSection category="Breads" items={breadItems} />
      </div>
    </div>
  );
};

export default Breads;
