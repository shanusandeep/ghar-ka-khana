
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MenuSection from "@/components/MenuSection";

const MainCourse = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const mainCourseItems = [
    { 
      name: "Veg Noodles", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Noodles", "Mixed vegetables (cabbage, carrots, bell peppers)", "Onions", "Garlic", "Ginger", "Soy sauce", "Chili sauce", "Vinegar", "Spring onions", "Oil", "Salt", "Black pepper"]
    },
    { 
      name: "Pav Bhaji", 
      price: "$120", 
      note: "With 100 Pav",
      image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Pav bread", "Potatoes", "Tomatoes", "Onions", "Bell peppers", "Green peas", "Cauliflower", "Garlic", "Ginger", "Pav bhaji masala", "Red chili powder", "Turmeric", "Butter", "Coriander leaves", "Lemon", "Salt"]
    },
    { 
      name: "Paneer Butter Masala", 
      price: "$130 / $75", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Paneer", "Tomatoes", "Onions", "Cashews", "Garlic", "Ginger", "Heavy cream", "Butter", "Garam masala", "Red chili powder", "Turmeric", "Cumin powder", "Coriander powder", "Fenugreek leaves", "Salt", "Sugar"]
    },
    { 
      name: "Malai Kofta", 
      price: "$130 / $75", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Paneer", "Potatoes", "Cashews", "Raisins", "Tomatoes", "Onions", "Heavy cream", "Garlic", "Ginger", "Garam masala", "Red chili powder", "Turmeric", "Cumin powder", "Coriander powder", "Cornflour", "Oil", "Salt"]
    },
    { 
      name: "Baigan Kalonji", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Eggplant", "Onions", "Tomatoes", "Garlic", "Ginger", "Nigella seeds (kalonji)", "Turmeric", "Red chili powder", "Coriander powder", "Cumin powder", "Garam masala", "Oil", "Mustard oil", "Salt"]
    },
    { 
      name: "Aloo Gobhi Dry", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1574653853027-5a3d8c4e8a8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Potatoes", "Cauliflower", "Onions", "Tomatoes", "Garlic", "Ginger", "Green chilies", "Turmeric", "Red chili powder", "Cumin seeds", "Coriander powder", "Garam masala", "Oil", "Coriander leaves", "Salt"]
    },
    { 
      name: "Mix Veg", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Mixed vegetables (carrots, beans, peas, bell peppers)", "Potatoes", "Onions", "Tomatoes", "Garlic", "Ginger", "Cumin seeds", "Turmeric", "Red chili powder", "Coriander powder", "Garam masala", "Oil", "Coriander leaves", "Salt"]
    },
    { 
      name: "Dal Makhni", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Black lentils", "Red kidney beans", "Tomatoes", "Onions", "Garlic", "Ginger", "Heavy cream", "Butter", "Cumin seeds", "Garam masala", "Red chili powder", "Turmeric", "Coriander powder", "Fenugreek leaves", "Salt"]
    },
    { 
      name: "Dal Fry", 
      price: "$120 / $70", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Yellow lentils (toor dal)", "Onions", "Tomatoes", "Garlic", "Ginger", "Cumin seeds", "Red chili powder", "Turmeric", "Garam masala", "Ghee", "Oil", "Coriander leaves", "Salt"]
    },
    { 
      name: "Chicken Curry", 
      price: "$130 / $75", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Chicken", "Onions", "Tomatoes", "Garlic", "Ginger", "Yogurt", "Coconut milk", "Cumin seeds", "Coriander seeds", "Turmeric", "Red chili powder", "Garam masala", "Bay leaves", "Oil", "Coriander leaves", "Salt"]
    },
    { 
      name: "Egg Curry", 
      price: "$110 / $60", 
      note: "Full tray / Half tray",
      image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      ingredients: ["Eggs", "Onions", "Tomatoes", "Garlic", "Ginger", "Green chilies", "Cumin seeds", "Turmeric", "Red chili powder", "Coriander powder", "Garam masala", "Coconut milk", "Oil", "Coriander leaves", "Salt"]
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
        
        <MenuSection category="Main Course" items={mainCourseItems} />
      </div>
    </div>
  );
};

export default MainCourse;
