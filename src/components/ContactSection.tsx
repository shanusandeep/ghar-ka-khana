
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Clock, MapPin, MessageCircle } from "lucide-react";

const ContactSection = () => {
  const handleEmailContact = () => {
    const subject = "Catering Inquiry - Ghar Ka Khana";
    const body = `Hello GharKaKhana,

I am interested in your catering services. Please provide me with more information about:

- Available dates
- Menu customization options
- Pricing for my event
- Delivery/setup details

Thank you!

Best regards,`;

    const mailtoLink = `mailto:gharkakhanarva@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
        <p className="text-lg text-gray-600">
          Ready to make your event delicious? Contact us today!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* WhatsApp Contact */}
        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <MessageCircle className="w-6 h-6" />
              <span>WhatsApp (Recommended)</span>
            </CardTitle>
            <CardDescription className="text-green-100">
              Quick responses and easy ordering
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                Get instant responses and place your orders quickly through WhatsApp.
              </p>
              <div className="flex items-center space-x-2 text-green-600 font-semibold">
                <Phone className="w-4 h-4" />
                <span>+1-201-713-1850</span>
              </div>
              <Button
                onClick={() => window.open("https://wa.me/12017131850", "_blank")}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start WhatsApp Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Contact */}
        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <Mail className="w-6 h-6" />
              <span>Email Us</span>
            </CardTitle>
            <CardDescription className="text-orange-100">
              Detailed inquiries and formal requests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                Send us detailed inquiries about catering for your special events.
              </p>
              <div className="flex items-center space-x-2 text-orange-600 font-semibold">
                <Mail className="w-4 h-4" />
                <span>gharkakhanarva@gmail.com</span>
              </div>
              <Button
                onClick={handleEmailContact}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-900">Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Operating Hours</h3>
              <p className="text-gray-600">
                Orders accepted daily<br />
                Advanced booking recommended
              </p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Service Area</h3>
              <p className="text-gray-600">
                Local delivery available<br />
                Contact us for coverage area
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="mt-12 text-center bg-white rounded-lg p-8 shadow-sm border border-orange-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Ghar Ka Khana?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl mb-2">👨‍🍳</div>
            <h4 className="font-semibold mb-2">Authentic Recipes</h4>
            <p className="text-sm text-gray-600">Traditional family recipes passed down through generations</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🌿</div>
            <h4 className="font-semibold mb-2">Fresh Ingredients</h4>
            <p className="text-sm text-gray-600">Daily sourced fresh ingredients for the best taste</p>
          </div>
          <div>
            <div className="text-3xl mb-2">❤️</div>
            <h4 className="font-semibold mb-2">Made with Love</h4>
            <p className="text-sm text-gray-600">Every dish prepared with care and attention to detail</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
