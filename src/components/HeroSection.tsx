import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin, Users, Utensils } from "lucide-react";

const HeroSection = () => {
  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu-heading');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-lg font-semibold">Premium Home Catering</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Authentic
            <span className="block text-yellow-300">Home-Style</span>
            <span className="block">Catering</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Experience the warmth of traditional Indian cuisine made with love, 
            fresh ingredients, and time-honored recipes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => window.open("https://chat.whatsapp.com/DT2GAo2yfrJFRpCv6EMBbW", "_blank")}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Users className="w-7 h-7" />
              Join Whatsapp Group
            </Button>
            <Button
              onClick={scrollToMenu}
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Utensils className="w-7 h-7" />
              View Menu
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Clock className="w-6 h-6 text-yellow-300" />
              <span className="font-semibold">Fresh Daily</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <MapPin className="w-6 h-6 text-yellow-300" />
              <span className="font-semibold">Local Pickup/Delivery</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Star className="w-6 h-6 text-yellow-300" />
              <span className="font-semibold">Premium Quality</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-300/10 rounded-full -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300/10 rounded-full translate-x-48 translate-y-48"></div>
    </section>
  );
};

export default HeroSection;
