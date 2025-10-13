import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Star, Search, ChefHat, Calendar, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearchButton } from "./GlobalSearchButton";

interface HamburgerMenuProps {
  activeSection: string;
  onMenuClick: () => void;
}

const HamburgerMenu = ({ activeSection, onMenuClick }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string, callback?: () => void) => {
    if (callback) {
      callback();
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="md:hidden p-2 hover:bg-orange-50"
        aria-label="Open navigation menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden border-l border-gray-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          backgroundColor: '#ffffff',
          opacity: 1,
          backdropFilter: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-orange-100 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Menu</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="p-2"
            >
              <X className="w-5 h-5 text-gray-700" />
            </Button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2 bg-white">
            <Button
              variant={activeSection === "menu" ? "default" : "ghost"}
              className={`w-full justify-start h-12 text-left font-medium ${
                activeSection === "menu" 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "text-gray-700 hover:bg-orange-50"
              }`}
              onClick={() => handleNavigation("", onMenuClick)}
            >
              <ChefHat className="w-5 h-5 mr-3" />
              Menu Categories
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-left text-gray-700 hover:bg-orange-50 font-medium"
              onClick={() => handleNavigation("/todays-menu")}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Today's Menu
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-left text-gray-700 hover:bg-orange-50 font-medium"
              onClick={() => handleNavigation("/reviews")}
            >
              <Star className="w-5 h-5 mr-3" />
              Reviews
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-left text-gray-700 hover:bg-orange-50 font-medium"
              onClick={() => handleNavigation("/about-us")}
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              About Us
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-left text-gray-700 hover:bg-orange-50 font-medium"
              onClick={() => handleNavigation("/admin")}
            >
              <Settings className="w-5 h-5 mr-3" />
              Admin Dashboard
            </Button>

            {/* Search Section */}
            <div className="pt-4 border-t border-gray-200 bg-white">
              <div className="text-sm font-medium text-gray-500 mb-3">Search</div>
              <div className="flex justify-center">
                <GlobalSearchButton />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-orange-100 bg-white">
            <div className="text-center text-sm text-gray-500">
              Ghar Ka Khana
              <br />
              Delicious Home Catering
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
