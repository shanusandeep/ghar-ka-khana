import { useState, useRef } from "react";
import { Phone, Mail, ChefHat, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactSection from "@/components/ContactSection";
import HeroSection from "@/components/HeroSection";
import CategoryCard from "@/components/CategoryCard";
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
                    onClick={() => setActiveSection("menu")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeSection === "menu" 
                        ? "bg-orange-500 text-white" 
                        : "text-gray-600 hover:text-orange-500"
                    }`}
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => navigate("/recipe-finder")}
                    className="px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-orange-500"
                  >
                    Recipe Finder
                  </button>
                  <button
                    onClick={scrollToContact}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeSection === "contact" 
                        ? "bg-orange-500 text-white" 
                        : "text-gray-600 hover:text-orange-500"
                    }`}
                  >
                    Contact
                  </button>
                  
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

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 p-4" role="navigation" aria-label="Mobile navigation">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveSection("menu")}
              className={`flex-1 py-3 px-2 rounded-lg text-center transition-colors text-sm ${
                activeSection === "menu" 
                  ? "bg-orange-500 text-white" 
                  : "text-gray-600 bg-orange-50"
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => navigate("/recipe-finder")}
              className="flex-1 py-3 px-2 rounded-lg text-center transition-colors text-sm text-gray-600 bg-orange-50"
            >
              Recipe Finder
            </button>
            <button
              onClick={scrollToContact}
              className={`flex-1 py-3 px-2 rounded-lg text-center transition-colors text-sm ${
                activeSection === "contact" 
                  ? "bg-orange-500 text-white" 
                  : "text-gray-600 bg-orange-50"
              }`}
            >
              Contact
            </button>
          </div>
        </nav>

        {/* Footer spacing for mobile nav */}
        <div className="md:hidden h-20" aria-hidden="true"></div>
      </div>
    </>
  );
};

export default Index;
