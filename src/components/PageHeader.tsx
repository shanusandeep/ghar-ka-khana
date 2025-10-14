import { Button } from "@/components/ui/button";
import { GlobalSearchButton } from "@/components/GlobalSearchButton";
import HamburgerMenu from "@/components/HamburgerMenu";
import { ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  activeSection?: string;
  onMenuClick?: () => void;
}

const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backTo = "/",
  activeSection = "menu",
  onMenuClick
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-orange-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                onClick={() => navigate(backTo)}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <img 
                src="/images/gharkakhana.png" 
                alt="Ghar Ka Khana Logo" 
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to the original G icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div 
                className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full items-center justify-center hidden"
                style={{ display: 'none' }}
              >
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-orange-600">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            <GlobalSearchButton />
            
            {user && (
              <Button
                onClick={() => navigate("/admin")}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            
            <HamburgerMenu 
              activeSection={activeSection} 
              onMenuClick={onMenuClick}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
