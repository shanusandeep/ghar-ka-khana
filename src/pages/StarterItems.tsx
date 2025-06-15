
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MenuSection from "@/components/MenuSection";

const StarterItems = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const starterItems = [
    { 
      name: "Babycorn/Paneer/Gobi/Soya Chilli", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Babycorn/Paneer/Cauliflower/Soya chunks", "Bell peppers", "Onions", "Garlic", "Ginger", "Soy sauce", "Chili sauce", "Tomato ketchup", "Cornflour", "Spring onions", "Oil", "Salt", "Black pepper"]
    },
    { 
      name: "Gobi/Paneer Manchurian", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Cauliflower/Paneer", "Onions", "Bell peppers", "Garlic", "Ginger", "Soy sauce", "Chili sauce", "Tomato sauce", "Vinegar", "Cornflour", "All-purpose flour", "Spring onions", "Oil", "Salt", "Sugar"]
    },
    { 
      name: "Aloo Papdi/Samosa Chat", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1574653853027-5a3d8c4e8a8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Papdi/Samosa", "Boiled potatoes", "Chickpeas", "Yogurt", "Tamarind chutney", "Mint chutney", "Onions", "Tomatoes", "Chaat masala", "Cumin powder", "Red chili powder", "Sev", "Coriander leaves", "Salt"]
    },
    { 
      name: "Pani Puri", 
      price: "$100 / $50", 
      note: "120 pieces / 60 pieces",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Puri shells", "Boiled potatoes", "Chickpeas", "Tamarind", "Mint leaves", "Coriander leaves", "Green chilies", "Ginger", "Black salt", "Cumin powder", "Chaat masala", "Jaggery", "Salt"]
    },
    { 
      name: "Veg Sliders", 
      price: "$110 / $60", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Mini burger buns", "Vegetable patty", "Lettuce", "Tomatoes", "Onions", "Cheese slice", "Mayonnaise", "Tomato ketchup", "Mustard sauce", "Pickles", "Salt", "Black pepper"]
    },
    { 
      name: "Pinwheel Roll", 
      price: "$110 / $60", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1544899489-a083461b088c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Tortilla/Chapati", "Cream cheese", "Vegetables (cucumber, carrots, bell peppers)", "Lettuce", "Mayonnaise", "Herbs", "Salt", "Black pepper", "Paprika"]
    },
    { 
      name: "Cajun Potatoes", 
      price: "$110 / $60", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Potatoes", "Cajun seasoning", "Paprika", "Cumin powder", "Garlic powder", "Onion powder", "Black pepper", "Red chili powder", "Oregano", "Thyme", "Oil", "Salt"]
    },
    { 
      name: "Hara Bhara Kabab", 
      price: "$130 / $75", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Spinach", "Green peas", "Potatoes", "Paneer", "Green chilies", "Ginger", "Garlic", "Mint leaves", "Coriander leaves", "Garam masala", "Cumin powder", "Breadcrumbs", "Cornflour", "Oil", "Salt"]
    },
    { 
      name: "Veg/Egg/Keema Puff", 
      price: "$100 / $50", 
      note: "50 pieces / 25 pieces",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Puff pastry", "Mixed vegetables/Eggs/Keema", "Onions", "Garlic", "Ginger", "Spices", "Coriander leaves", "Oil", "Salt", "Black pepper"]
    },
    { 
      name: "Chicken Manchurian/Chilli", 
      price: "$130 / $75", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Chicken", "Onions", "Bell peppers", "Garlic", "Ginger", "Soy sauce", "Chili sauce", "Tomato sauce", "Vinegar", "Cornflour", "All-purpose flour", "Spring onions", "Oil", "Salt", "Sugar", "Egg"]
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
        
        <MenuSection category="Starter Items" items={starterItems} />
      </div>
    </div>
  );
};

export default StarterItems;
