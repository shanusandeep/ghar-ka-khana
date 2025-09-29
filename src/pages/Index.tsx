import { useState, useRef } from "react";
import { Phone, Mail, ChefHat, Settings, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactSection from "@/components/ContactSection";
import HeroSection from "@/components/HeroSection";
import CategoryCard from "@/components/CategoryCard";
import HorizontalReviews from "@/components/HorizontalReviews";
import { GlobalSearchButton } from "@/components/GlobalSearchButton";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeSection, setActiveSection] = useState("menu");
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToContact = () => {
    setActiveSection("contact");
    setTimeout(() => {
      contactSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const scrollToMenu = () => {
    setActiveSection("menu");
    setTimeout(() => {
      const menuSection = document.getElementById('menu-heading');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const categories = [
    {
      category: "Starter Items",
      icon: "🥗",
      description: "Delicious appetizers to start your meal",
      route: "/starter-items",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      category: "Main Course",
      icon: "🍛",
      description: "Hearty main dishes with authentic flavors",
      route: "/main-course",
      gradient: "from-orange-500 to-red-600"
    },
    {
      category: "Breads",
      icon: "🫓",
      description: "Freshly made traditional breads",
      route: "/breads",
      gradient: "from-amber-500 to-yellow-600"
    },
    {
      category: "Rice",
      icon: "🍚",
      description: "Fragrant rice dishes and biryanis",
      route: "/rice",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      category: "Dessert",
      icon: "🍮",
      description: "Sweet treats to end your meal perfectly",
      route: "/dessert",
      gradient: "from-pink-500 to-purple-600"
    }
  ];

  // Structured data for Google Rich Results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Ghar Ka Khana",
    "image": "https://gharkakhanaonline.com/og-image.svg",
    "description": "Authentic home-style Indian catering service in Glen Allen. Fresh ingredients and traditional recipes for all occasions.",
    "@id": "https://gharkakhanaonline.com",
    "url": "https://gharkakhanaonline.com",
    "telephone": "+1-201-713-1850",
    "servesCuisine": "Indian",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "VA",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "addressRegion": "Glen Allen"
    },
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://wa.me/12017131850",
        "inLanguage": "en-US",
        "actionPlatform": [
          "http://schema.org/WhatsApp"
        ]
      },
      "deliveryMethod": [
        "http://purl.org/goodrelations/v1#DeliveryModePickUp"
      ]
    }
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Navigation */}
        <header>
          <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-orange-100" role="navigation" aria-label="Main navigation">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-xl text-gray-900">Ghar Ka Khana</h1>
                    <p className="text-sm text-orange-600">Delicious Home Catering</p>
                  </div>
                </div>
                
                <div className="hidden md:flex space-x-6 items-center">
                  <button
                    onClick={scrollToMenu}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeSection === "menu" 
                        ? "bg-orange-500 text-white" 
                        : "text-gray-600 hover:text-orange-500"
                    }`}
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => navigate("/todays-menu")}
                    className="px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-orange-500 flex items-center gap-1"
                  >
                    Today's Menu
                  </button>
                  <button
                    onClick={() => navigate("/reviews")}
                    className="px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-orange-500 flex items-center gap-1"
                  >
                    <Star className="w-4 h-4" />
                    Reviews
                  </button>
                  
                  {/* Global Menu Search */}
                  <GlobalSearchButton />
                  
                  {/* Admin link - only show if user is logged in */}
                  {user && (
                    <Button
                      onClick={() => navigate("/admin")}
                      variant="outline"
                      size="sm"
                      className="ml-4 border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => window.open("https://wa.me/12017131850", "_blank")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </Button>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <HeroSection />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8" role="main">
          {activeSection === "menu" && (
            <section aria-labelledby="menu-heading">
              <div className="text-center mb-12">
                <h2 id="menu-heading" className="text-4xl font-bold text-gray-900 mb-4">Our Menu Categories</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore our delicious categories of authentic homestyle cooking. Click on any category to see the full menu and prices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" role="list">
                {categories.map((category) => (
                  <div key={category.category} role="listitem">
                    <CategoryCard
                      category={category.category}
                      icon={category.icon}
                      description={category.description}
                      route={category.route}
                      gradient={category.gradient}
                    />
                  </div>
                ))}
              </div>

              {/* Party/Catering Orders Section */}
              <section aria-labelledby="catering-heading" className="mt-16 mb-16">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <h3 id="catering-heading" className="text-3xl font-bold text-gray-900 mb-4">
                      Party & Catering Orders
                    </h3>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Planning a special event? We provide delicious catering services for parties, 
                      celebrations, and gatherings. Contact us to discuss your requirements!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-3xl mb-2">🎂</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Birthday Parties</h4>
                      <p className="text-sm text-gray-600">Make celebrations memorable with our authentic flavors</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-3xl mb-2">💒</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Wedding Events</h4>
                      <p className="text-sm text-gray-600">Traditional dishes for your special day</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-3xl mb-2">🏢</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Corporate Events</h4>
                      <p className="text-sm text-gray-600">Professional catering for business gatherings</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={() => window.open("https://wa.me/12017131850?text=Hi! I'm interested in party/catering services. Could you please provide more details?", "_blank")}
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <Phone className="w-5 h-5" />
                      Contact for Catering
                    </Button>
                    <p className="text-sm text-gray-500 mt-3">
                      Click to message us on WhatsApp for custom catering quotes
                    </p>
                  </div>
                </div>
              </section>

              {/* Customer Reviews Section */}
              <HorizontalReviews />

              {/* Call to Action */}
              <section aria-labelledby="cta-heading" className="mt-16 text-center bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white">
                <h3 id="cta-heading" className="text-2xl font-bold mb-4">Ready to Order?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Contact us via WhatsApp or email to place your order today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => window.open("https://wa.me/12017131850", "_blank")}
                    variant="secondary"
                    className="bg-white text-orange-600 hover:bg-orange-50"
                    aria-label="Order via WhatsApp"
                  >
                    <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                    Order via WhatsApp
                  </Button>
                  <Button
                    onClick={() => setActiveSection("contact")}
                    variant="outline"
                    className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                    aria-label="Contact Us"
                  >
                    <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                    Contact Us
                  </Button>
                </div>
              </section>
            </section>
          )}

          {activeSection === "contact" && (
            <div ref={contactSectionRef}>
              <ContactSection />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-orange-100 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">G</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">Ghar Ka Khana</h3>
                    <p className="text-sm text-orange-600">Delicious Home Catering</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 max-w-md">
                  Experience the warmth of traditional Indian cuisine made with love, fresh ingredients, and time-honored recipes.
                </p>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => window.open("https://wa.me/12017131850", "_blank")}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => window.open("tel:+12017131850", "_blank")}
                    size="sm"
                    variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Us
                  </Button>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveSection("menu")}
                      className="text-gray-600 hover:text-orange-500 transition-colors"
                    >
                      Menu Categories
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/todays-menu")}
                      className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1"
                    >
                      Today's Menu
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/recipe-finder")}
                      className="text-gray-600 hover:text-orange-500 transition-colors"
                    >
                      Recipe Finder
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/about-us")}
                      className="text-gray-600 hover:text-orange-500 transition-colors"
                    >
                      About Us
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Contact Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">(201) 713-1850</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">info@gharkakhana.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">Glen Allen, VA</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/about-us")}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    View full contact details →
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-orange-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © 2024 Ghar Ka Khana. All rights reserved.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <span className="text-gray-500 text-sm">Made with ❤️ for authentic taste</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 p-2" role="navigation" aria-label="Mobile navigation">
          <div className="flex space-x-1">
            <button
              onClick={scrollToMenu}
              className={`flex-1 py-2 px-1 rounded-lg text-center transition-colors text-xs ${
                activeSection === "menu" 
                  ? "bg-orange-500 text-white" 
                  : "text-gray-600 bg-orange-50"
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => navigate("/todays-menu")}
              className="flex-1 py-2 px-1 rounded-lg text-center transition-colors text-xs text-gray-600 bg-orange-50 flex items-center justify-center gap-1"
            >
              <span className="text-orange-500">⭐</span>
              <span className="hidden sm:inline">Today's</span>
            </button>
            <button
              onClick={() => navigate("/reviews")}
              className="flex-1 py-2 px-1 rounded-lg text-center transition-colors text-xs text-gray-600 bg-orange-50 flex items-center justify-center gap-1"
            >
              <Star className="w-3 h-3 text-orange-500" />
              <span className="hidden sm:inline">Reviews</span>
            </button>
            <div className="flex items-center justify-center min-w-[60px]">
              <GlobalSearchButton />
            </div>
          </div>
        </nav>

        {/* Footer spacing for mobile nav */}
        <div className="md:hidden h-16" aria-hidden="true"></div>
      </div>
    </>
  );
};

export default Index;
