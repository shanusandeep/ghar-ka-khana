
import React from 'react';
import { Phone, Mail, MessageCircle, Star, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const menuCategories = [
    {
      name: "Appetizers",
      items: [
        { name: "Samosas (4 pcs)", price: "$8.99", description: "Crispy pastry filled with spiced potatoes and peas" },
        { name: "Chicken Tikka", price: "$12.99", description: "Tender marinated chicken grilled to perfection" },
        { name: "Paneer Pakora", price: "$10.99", description: "Golden fried cottage cheese fritters" }
      ]
    },
    {
      name: "Main Courses",
      items: [
        { name: "Butter Chicken", price: "$16.99", description: "Creamy tomato-based curry with tender chicken" },
        { name: "Biryani (Chicken/Veg)", price: "$14.99", description: "Aromatic basmati rice with spices and your choice of protein" },
        { name: "Dal Makhani", price: "$12.99", description: "Rich and creamy black lentils slow-cooked with butter" }
      ]
    },
    {
      name: "Desserts",
      items: [
        { name: "Gulab Jamun (2 pcs)", price: "$5.99", description: "Soft milk dumplings in cardamom syrup" },
        { name: "Ras Malai (2 pcs)", price: "$6.99", description: "Delicate cottage cheese dumplings in sweet milk" },
        { name: "Kheer", price: "$4.99", description: "Traditional rice pudding with nuts and cardamom" }
      ]
    }
  ];

  const specialDishes = [
    { name: "Royal Thali", description: "Complete meal with variety of dishes", image: "/placeholder.svg" },
    { name: "Wedding Special Combo", description: "Perfect for celebrations", image: "/placeholder.svg" },
    { name: "Party Platter", description: "Assorted appetizers for groups", image: "/placeholder.svg" }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-orange-600">Ghar Ka Khana</h1>
              <p className="text-gray-600">Authentic Home Catering</p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600 text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button onClick={handleEmail} variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold mb-6">Bringing Home-Cooked Flavors to Your Events</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Experience authentic, delicious meals prepared with love and the finest ingredients. Perfect for any occasion.</p>
          <div className="flex justify-center space-x-8 text-center">
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              <span>5-Star Quality</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>Fresh Daily</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>Local Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Menu</h3>
          <div className="space-y-12">
            {menuCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-lg p-8">
                <h4 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2">
                  {category.name}
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <Card key={itemIndex} className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-semibold text-lg text-gray-800">{item.name}</h5>
                          <span className="text-xl font-bold text-orange-600">{item.price}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Dishes */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h3 className="text-4xl font-bold text-center mb-12 text-gray-800">Special Offerings</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialDishes.map((dish, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-r from-orange-200 to-red-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Food Image Placeholder</span>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-2 text-gray-800">{dish.name}</h4>
                  <p className="text-gray-600">{dish.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-orange-600 text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold mb-8">Ready to Order?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Get in touch with us to discuss your catering needs. We're here to make your event delicious and memorable!</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white text-gray-800 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h4 className="text-xl font-bold mb-3">WhatsApp</h4>
                <p className="mb-4">Quick responses and instant communication</p>
                <Button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600 text-white w-full">
                  Message Us Now
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white text-gray-800 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h4 className="text-xl font-bold mb-3">Email</h4>
                <p className="mb-4">Detailed inquiries and event planning</p>
                <Button onClick={handleEmail} className="bg-blue-500 hover:bg-blue-600 text-white w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg mb-2">📞 +1-201-713-1850</p>
            <p className="text-lg">📧 gharkakhanarva@gmail.com</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 text-orange-400">Ghar Ka Khana</h3>
          <p className="text-gray-300 mb-4">Bringing the taste of home to your special occasions</p>
          <p className="text-sm text-gray-400">© 2024 Ghar Ka Khana. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
