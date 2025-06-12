import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import ImageModal from "./ImageModal";

interface MenuItem {
  name: string;
  price: string;
  note?: string;
  image?: string;
  ingredients?: string[];
}

interface MenuSectionProps {
  category: string;
  items: MenuItem[];
}

const MenuSection = ({ category, items }: MenuSectionProps) => {
  const { trackEvent } = useAnalytics();
  const [modalImage, setModalImage] = useState<{ url: string; name: string; ingredients?: string[] } | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'starter items':
        return '🥗';
      case 'main course':
        return '🍛';
      case 'breads':
        return '🫓';
      case 'rice':
        return '🍚';
      case 'dessert':
        return '🍮';
      default:
        return '🍽️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'starter items':
        return 'from-green-500 to-emerald-600';
      case 'main course':
        return 'from-orange-500 to-red-600';
      case 'breads':
        return 'from-amber-500 to-yellow-600';
      case 'rice':
        return 'from-blue-500 to-indigo-600';
      case 'dessert':
        return 'from-pink-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleImageClick = (imageUrl: string, itemName: string, ingredients?: string[]) => {
    setModalImage({ url: imageUrl, name: itemName, ingredients });
    trackEvent('image_view', 'menu_item', `${category} - ${itemName}`);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <>
      <Card className="overflow-hidden shadow-lg border-0 bg-white" id="menu">
        <CardHeader className={`bg-gradient-to-r ${getCategoryColor(category)} text-white p-6`}>
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center space-x-3">
            <span className="text-3xl">{getCategoryIcon(category)}</span>
            <span>{category}</span>
          </CardTitle>
          <CardDescription className="text-white/90 text-lg">
            Delicious {category.toLowerCase()} made with authentic recipes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid gap-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Image Section */}
                {item.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full md:w-32 md:h-32 h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(item.image!, item.name, item.ingredients)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Content Section */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between w-full">
                  <div className="flex-1 mb-3 md:mb-0">
                    <h4 className="font-semibold text-gray-900 text-lg md:text-xl mb-1">{item.name}</h4>
                    {item.note && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-row justify-between md:justify-end items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{item.price}</div>
                    </div>
                    <Button
                      onClick={() => {
                        const message = `Hello GharKaKhana! I'd like to order ${item.name} (${item.price}${item.note ? ` - ${item.note}` : ''}) from your ${category} menu.`;
                        trackEvent(
                          'order_click',
                          'menu_item',
                          `${category} - ${item.name}`,
                          parseFloat(item.price.replace(/[^0-9.]/g, ''))
                        );
                        window.open(`https://wa.me/12017131850?text=${encodeURIComponent(message)}`, "_blank");
                      }}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4 py-2 whitespace-nowrap"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Order
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-sm mt-6 text-center italic">
            * Every menu item is fully customizable to your taste.
          </p>
        </CardContent>
      </Card>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalImage !== null}
        imageUrl={modalImage?.url || ''}
        imageName={modalImage?.name || ''}
        ingredients={modalImage?.ingredients}
        onClose={closeModal}
      />
    </>
  );
};

export default MenuSection;
