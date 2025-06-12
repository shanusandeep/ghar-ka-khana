
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MenuSection from "@/components/MenuSection";

const Dessert = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const dessertItems = [
    { 
      name: "Baklava", 
      price: "$120 / $60", 
      note: "120 pieces / 60 pieces",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Phyllo pastry", "Mixed nuts (walnuts, almonds, pistachios)", "Butter", "Sugar", "Honey", "Water", "Lemon juice", "Cinnamon", "Cloves"]
    },
    { 
      name: "Gulab Jamun", 
      price: "$90 / $50", 
      note: "130 pieces / 60 pieces",
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Milk powder", "All-purpose flour", "Baking soda", "Ghee", "Milk", "Sugar", "Water", "Cardamom", "Rose water", "Oil for frying"]
    },
    { 
      name: "Fruit Custard (with Fruits & Nuts)", 
      price: "$130 / $75", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Milk", "Custard powder", "Sugar", "Mixed fruits (apple, banana, grapes, pomegranate)", "Mixed nuts (almonds, cashews)", "Vanilla essence"]
    },
    { 
      name: "Rasmalai", 
      price: "$100 / $50", 
      note: "100 pieces / 50 pieces",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Paneer", "Milk", "Sugar", "Cardamom", "Saffron", "Almonds", "Pistachios", "Lemon juice"]
    },
    { 
      name: "Dates Laddoo", 
      price: "$2", 
      note: "Per piece (minimum 25 pieces)",
      image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Dates", "Almonds", "Cashews", "Walnuts", "Coconut powder", "Cardamom", "Ghee"]
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
        
        <MenuSection category="Dessert" items={dessertItems} />
      </div>
    </div>
  );
};

export default Dessert;
