
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  category: string;
  icon: string;
  description: string;
  route: string;
  gradient: string;
}

const CategoryCard = ({ category, icon, description, route, gradient }: CategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden shadow-lg border-0 bg-white cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
      onClick={() => navigate(route)}
    >
      <CardContent className="p-0">
        <div className={`bg-gradient-to-r ${gradient} text-white p-6 text-center`}>
          <div className="text-4xl mb-3">{icon}</div>
          <h3 className="text-xl font-bold mb-2">{category}</h3>
          <p className="text-white/90 text-sm">{description}</p>
        </div>
        
        <div className="p-4 flex items-center justify-between bg-white">
          <span className="text-gray-700 font-medium">Full Menu</span>
          <ChevronRight className="w-5 h-5 text-orange-500" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
