
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MenuSection from "@/components/MenuSection";

const Rice = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const riceItems = [
    { 
      name: "Fried Rice", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Basmati rice", "Mixed vegetables (carrots, beans, peas)", "Onions", "Garlic", "Ginger", "Soy sauce", "Vinegar", "Spring onions", "Oil", "Salt", "Black pepper"]
    },
    { 
      name: "Veg/Kathal Biryani", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Basmati rice", "Mixed vegetables/Jackfruit", "Onions", "Yogurt", "Garlic", "Ginger", "Biryani masala", "Saffron", "Mint leaves", "Coriander leaves", "Bay leaves", "Cardamom", "Cinnamon", "Cloves", "Ghee", "Oil", "Salt"]
    },
    { 
      name: "Chicken Biryani", 
      price: "$130 / $75", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1563379091339-03246963d24a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Basmati rice", "Chicken", "Onions", "Yogurt", "Garlic", "Ginger", "Biryani masala", "Red chili powder", "Turmeric", "Saffron", "Mint leaves", "Coriander leaves", "Bay leaves", "Cardamom", "Cinnamon", "Cloves", "Ghee", "Oil", "Salt"]
    },
    { 
      name: "Tawa Pulao", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Basmati rice", "Mixed vegetables", "Onions", "Tomatoes", "Bell peppers", "Garlic", "Ginger", "Pav bhaji masala", "Red chili powder", "Turmeric", "Cumin seeds", "Butter", "Oil", "Coriander leaves", "Salt"]
    },
    { 
      name: "Paneer Tawa Pulao", 
      price: "$130 / $75", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Basmati rice", "Paneer", "Mixed vegetables", "Onions", "Tomatoes", "Bell peppers", "Garlic", "Ginger", "Pav bhaji masala", "Red chili powder", "Turmeric", "Cumin seeds", "Butter", "Oil", "Coriander leaves", "Salt"]
    },
    { 
      name: "Lemon Rice", 
      price: "$110 / $60", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Basmati rice", "Lemons", "Peanuts", "Cashews", "Curry leaves", "Mustard seeds", "Cumin seeds", "Green chilies", "Ginger", "Turmeric", "Asafoetida", "Oil", "Salt"]
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
        
        <MenuSection category="Rice" items={riceItems} />
      </div>
    </div>
  );
};

export default Rice;
