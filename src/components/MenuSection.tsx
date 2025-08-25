import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Edit } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import ImageModal from "./ImageModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState<{ url: string; name: string; ingredients?: string[]; price?: string; note?: string; index: number } | null>(null);

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

  const handleImageClick = (imageUrl: string, itemName: string, index: number, ingredients?: string[], price?: string, note?: string) => {
    setModalImage({ url: imageUrl, name: itemName, ingredients, price, note, index });
    trackEvent('image_view', 'menu_item', `${category} - ${itemName}`);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const handleEditItem = (itemName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent image modal from opening
    // Navigate to admin with edit item context - we'll need to implement this in admin
    navigate('/admin', { state: { editItem: itemName, category } });
  };

  const handlePreviousImage = () => {
    if (!modalImage) return;
    
    // Find the previous item with an image
    for (let i = modalImage.index - 1; i >= 0; i--) {
      const prevItem = items[i];
      if (prevItem.image) {
        setModalImage({
          url: prevItem.image,
          name: prevItem.name,
          ingredients: prevItem.ingredients,
          price: prevItem.price,
          note: prevItem.note,
          index: i
        });
        break;
      }
    }
  };

  const handleNextImage = () => {
    if (!modalImage) return;
    
    // Find the next item with an image
    for (let i = modalImage.index + 1; i < items.length; i++) {
      const nextItem = items[i];
      if (nextItem.image) {
        setModalImage({
          url: nextItem.image,
          name: nextItem.name,
          ingredients: nextItem.ingredients,
          price: nextItem.price,
          note: nextItem.note,
          index: i
        });
        break;
      }
    }
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {items.map((item, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
              >
                {/* Image Section */}
                {item.image && (
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      onClick={() => handleImageClick(item.image!, item.name, index, item.ingredients, item.price, item.note)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    
                    {/* Edit icon overlay - only show for admin users */}
                    {user && (
                      <button
                        onClick={(e) => handleEditItem(item.name, e)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Edit item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* Content Section */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">{item.name}</h4>
                    {item.note && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.note}
                      </p>
                    )}
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {item.ingredients.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.ingredients.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center">
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
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Order Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
        price={modalImage?.price}
        note={modalImage?.note}
        onClose={closeModal}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
        currentIndex={modalImage?.index}
        totalItems={items.length}
        category={category}
      />
    </>
  );
};

export default MenuSection;
