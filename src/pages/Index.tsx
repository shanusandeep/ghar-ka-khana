
import React from 'react';
import { Phone, Mail, MessageCircle, Star, Clock, MapPin, Utensils, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const menuCategories = [
    {
      name: "Starter Items",
      icon: <Utensils className="h-6 w-6" />,
      items: [
        { name: "Babycorn/Paneer/Gobi/Soya Chilli", price: "$120", description: "Crispy and flavorful Indo-Chinese appetizers" },
        { name: "Gobi/Paneer Manchurian", price: "$120", description: "Popular Indo-Chinese starter with tangy sauce" },
        { name: "Aloo Papdi/Samosa Chat", price: "$120", description: "Traditional street food favorite" },
        { name: "Pani Puri", price: "$100", description: "Interactive crispy shells with flavored water" },
        { name: "Veg Sliders", price: "$110", description: "Mini burgers perfect for parties" },
        { name: "Pinwheel Roll", price: "$110", description: "Colorful rolled appetizers" },
        { name: "Cajun Potatoes", price: "$110", description: "Spiced potato wedges with herbs" },
        { name: "Hara Bhara Kabab", price: "$130", description: "Green vegetable patties, pan-fried to perfection" },
        { name: "Veg/Egg/Keema Puff", price: "$100", description: "50 pieces - Flaky pastries with savory filling" },
        { name: "Chicken Manchurian/Chilli", price: "$130", description: "Tender chicken in spicy Indo-Chinese sauce" }
      ]
    },
    {
      name: "Main Course",
      icon: <ChefHat className="h-6 w-6" />,
      items: [
        { name: "Veg Noodles", price: "$120", description: "Stir-fried noodles with fresh vegetables" },
        { name: "Pav Bhaji", price: "$120", description: "Includes 100 Pav - Mumbai street food classic" },
        { name: "Paneer Butter Masala", price: "$130", description: "Creamy tomato-based cottage cheese curry" },
        { name: "Malai Kofta", price: "$130", description: "Fried dumplings in rich creamy gravy" },
        { name: "Baigan Kalonji", price: "$120", description: "Eggplant curry with nigella seeds" },
        { name: "Aloo Gobhi Dry", price: "$120", description: "Spiced potato and cauliflower dish" },
        { name: "Mix Veg", price: "$120", description: "Seasonal vegetables cooked with aromatic spices" },
        { name: "Dal Makhni", price: "$120", description: "Creamy black lentils slow-cooked with butter" },
        { name: "Dal Fry", price: "$100", description: "Yellow lentils tempered with spices" },
        { name: "Chicken Curry", price: "$130", description: "Traditional chicken curry with authentic spices" },
        { name: "Egg Curry", price: "$110", description: "Hard-boiled eggs in spiced tomato gravy" }
      ]
    },
    {
      name: "Breads",
      icon: <Utensils className="h-6 w-6" />,
      items: [
        { name: "Roti/Poori", price: "$1", description: "2 pieces - Traditional Indian flatbreads" },
        { name: "Plain Paratha", price: "$1/pc", description: "Layered flatbread, buttered and flaky" },
        { name: "Stuffed Paratha", price: "$2/pc", description: "Aloo/Gobi/Paneer/Chinese - Filled flatbreads" }
      ]
    },
    {
      name: "Rice",
      icon: <Utensils className="h-6 w-6" />,
      items: [
        { name: "Fried Rice", price: "$120", description: "Wok-tossed rice with vegetables and soy sauce" },
        { name: "Veg/Kathal Biryani", price: "$120", description: "Aromatic basmati rice with vegetables or jackfruit" },
        { name: "Chicken Biryani", price: "$130", description: "Fragrant rice layered with spiced chicken" },
        { name: "Tawa Pulao", price: "$120", description: "Street-style rice cooked on griddle" },
        { name: "Paneer Tawa Pulao", price: "$130", description: "Tawa pulao with cottage cheese" },
        { name: "Lemon Rice", price: "$110", description: "South Indian style tangy rice" }
      ]
    },
    {
      name: "Desserts",
      icon: <Utensils className="h-6 w-6" />,
      items: [
        { name: "Baklava", price: "$120", description: "120 pieces - Layered pastry with nuts and honey" },
        { name: "Gulab Jamun", price: "$90", description: "130 pieces - Soft milk dumplings in sugar syrup" },
        { name: "Fruit Custard", price: "$130", description: "5 fruits & nuts - Creamy dessert with fresh fruits" },
        { name: "Rasmalai", price: "$150", description: "100 pieces - Cottage cheese dumplings in sweet milk" },
        { name: "Dates Laddoo", price: "$100", description: "50 pieces - Healthy sweet balls with dates and nuts" }
      ]
    }
  ];

  const specialDishes = [
    { name: "Wedding Feast Package", description: "Complete multi-course meal for celebrations", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" },
    { name: "Corporate Lunch Platter", description: "Professional catering for office events", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80" },
    { name: "Festival Special Combo", description: "Traditional dishes for festive occasions", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" }
  ];

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in your catering services. Could you please provide more information?");
    window.open(`https://wa.me/12017131850?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Catering Service Inquiry");
    const body = encodeURIComponent(`Dear Ghar Ka Khana Team,

I am interested in your catering services. Please provide me with more information about:

- Available menu options
- Pricing for my event
- Minimum order requirements
- Delivery/setup options

Event Details:
- Date: 
- Number of guests: 
- Event type: 
- Location: 

Thank you for your time.

Best regards,
`);
    window.location.href = `mailto:gharkakhanarva@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-xl sticky top-0 z-50 border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Ghar Ka Khana
                </h1>
                <p className="text-gray-600 font-medium">Authentic Home Catering</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button onClick={handleEmail} variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 shadow-lg">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto relative z-10">
          <h2 className="text-6xl font-bold mb-6 leading-tight">
            Bringing Home-Cooked 
            <span className="block text-yellow-300">Flavors to Your Events</span>
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Experience authentic, delicious meals prepared with love and the finest ingredients. 
            Perfect for weddings, corporate events, and special celebrations.
          </p>
          <div className="flex justify-center space-x-8 text-center">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Star className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="font-semibold">Premium Quality</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Clock className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="font-semibold">Fresh Daily</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <MapPin className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="font-semibold">Local Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Our Delicious Menu
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our extensive collection of authentic dishes, prepared with traditional recipes and the finest ingredients
            </p>
          </div>
          
          <Tabs defaultValue="starter" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-12 bg-orange-50 rounded-xl p-2">
              {menuCategories.map((category, index) => (
                <TabsTrigger 
                  key={index} 
                  value={category.name.toLowerCase().replace(' ', '')} 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 rounded-lg py-3"
                >
                  {category.icon}
                  <span className="font-semibold">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {menuCategories.map((category, categoryIndex) => (
              <TabsContent 
                key={categoryIndex} 
                value={category.name.toLowerCase().replace(' ', '')}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <Card key={itemIndex} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50/30">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors leading-tight">
                            {item.name}
                          </h5>
                          <span className="text-2xl font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                            {item.price}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Special Dishes */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Special Offerings
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Curated packages perfect for your special occasions and events
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialDishes.map((dish, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0 shadow-lg hover:-translate-y-2">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6 bg-gradient-to-br from-white to-orange-50/30">
                  <h4 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-orange-600 transition-colors">
                    {dish.name}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">{dish.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h3 className="text-5xl font-bold mb-8">Ready to Order?</h3>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Get in touch with us to discuss your catering needs. We're here to make your event delicious and memorable!
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 border-white/20 hover:shadow-2xl hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-6 text-green-400" />
                <h4 className="text-2xl font-bold mb-4">WhatsApp</h4>
                <p className="mb-6 opacity-90">Quick responses and instant communication</p>
                <Button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600 text-white w-full py-3 text-lg font-semibold">
                  Message Us Now
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 border-white/20 hover:shadow-2xl hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <Mail className="h-16 w-16 mx-auto mb-6 text-blue-400" />
                <h4 className="text-2xl font-bold mb-4">Email</h4>
                <p className="mb-6 opacity-90">Detailed inquiries and event planning</p>
                <Button onClick={handleEmail} className="bg-blue-500 hover:bg-blue-600 text-white w-full py-3 text-lg font-semibold">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-2xl mb-4 font-semibold">📞 +1-201-713-1850</p>
            <p className="text-2xl font-semibold">📧 gharkakhanarva@gmail.com</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Ghar Ka Khana
            </h3>
          </div>
          <p className="text-gray-300 mb-6 text-lg">Bringing the taste of home to your special occasions</p>
          <p className="text-sm text-gray-400">© 2024 Ghar Ka Khana. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
