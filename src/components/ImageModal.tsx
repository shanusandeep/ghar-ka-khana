import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import type { FC } from "react";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageName: string;
  ingredients?: string[];
  price?: string;
  note?: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalItems?: number;
}

const ImageModal: FC<ImageModalProps> = ({ 
  isOpen, 
  imageUrl, 
  imageName, 
  ingredients, 
  price, 
  note, 
  onClose, 
  onPrevious, 
  onNext, 
  currentIndex, 
  totalItems 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrevious, onNext]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col lg:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Image container */}
        <div className="relative flex-1 overflow-hidden rounded-lg lg:rounded-r-none shadow-2xl bg-white">
          <img
            src={imageUrl}
            alt={imageName}
            className="w-full h-full object-cover max-h-[50vh] lg:max-h-[80vh]"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {/* Navigation arrows */}
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          
          {/* Image counter */}
          {currentIndex !== undefined && totalItems !== undefined && totalItems > 1 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {totalItems}
            </div>
          )}
          
          {/* Title/price overlay for mobile when there is minimal side info */}
          {(!ingredients || ingredients.length === 0) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h3 className="text-white text-xl md:text-2xl font-bold">
                {imageName}
              </h3>
              {(price || note) && (
                <p className="text-white/90 text-sm mt-1">
                  {price}
                  {note ? ` • ${note}` : ''}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Ingredients panel */}
        {(ingredients && ingredients.length > 0) || price || note ? (
          <div className="lg:w-96 bg-white p-6 overflow-y-auto rounded-lg lg:rounded-l-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {imageName}
            </h3>
            {(price || note) && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Pricing</h4>
                <div className="text-gray-900">
                  {price && <div className="text-xl font-bold text-orange-600">{price}</div>}
                  {note && <div className="text-sm text-gray-600 mt-1">{note}</div>}
                </div>
              </div>
            )}
            
            {ingredients && ingredients.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  🥘 Ingredients
                </h4>
                <ul className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <li 
                      key={index} 
                      className="flex items-start space-x-2 text-gray-700"
                    >
                      <span className="text-orange-500 font-bold mt-1">•</span>
                      <span className="text-sm leading-relaxed">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="text-xs text-gray-500 italic border-t pt-4">
              * Ingredients may vary based on availability and customization requests
            </div>
          </div>
        ) : null}
        
        {/* Instructions text */}
        <p className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white text-center text-sm opacity-75 whitespace-nowrap">
          Click anywhere outside or press ESC to close {totalItems && totalItems > 1 ? '• Use ← → arrow keys to navigate' : ''}
        </p>
      </div>
    </div>
  );
};

export default ImageModal; 