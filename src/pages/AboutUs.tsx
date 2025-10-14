import React from 'react'
import { ArrowLeft, Phone, Mail, MapPin, Clock, Users, Star, Heart, ChefHat, Utensils, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { GlobalSearchButton } from '@/components/GlobalSearchButton'
import PageHeader from '@/components/PageHeader'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

const AboutUs = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <PageHeader 
        title="About Us"
        subtitle="Our Story & Mission"
        showBackButton={true}
        backTo="/"
        activeSection="about"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <section className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Authentic Home-Style
              <span className="block text-orange-600">Catering</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Bringing the warmth and flavors of traditional Indian home cooking to your special occasions, 
              corporate events, and everyday celebrations.
            </p>
          </section>

          {/* Our Story */}
          <section>
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Ghar Ka Khana was born from a simple yet powerful idea: to share the authentic flavors 
                      of Indian home cooking with our community. What started as a family's passion for 
                      traditional recipes has grown into a beloved catering service that brings people together 
                      through the universal language of delicious food.
                    </p>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Our journey began in the heart of Glen Allen, Virginia, where we discovered that 
                      our neighbors craved the same authentic, home-cooked Indian meals that we grew up with. 
                      Today, we're proud to serve not just food, but memories and traditions that connect 
                      families and friends.
                    </p>
                    <div className="flex items-center gap-2 text-orange-600">
                      <Heart className="w-5 h-5" />
                      <span className="font-semibold">Made with love, served with pride</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-8 text-center">
                    <ChefHat className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Family Recipes</h4>
                    <p className="text-gray-600">
                      Every dish tells a story of tradition, passed down through generations of home cooks 
                      who understood that the best meals are made with love and fresh ingredients.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Our Mission & Values */}
          <section>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Authentic Flavors</h4>
                <p className="text-gray-600">
                  We preserve traditional recipes and cooking methods to deliver the authentic taste 
                  of Indian home cooking.
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Fresh Daily</h4>
                <p className="text-gray-600">
                  Every dish is prepared fresh daily using the finest ingredients, ensuring quality 
                  and taste in every bite.
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Community First</h4>
                <p className="text-gray-600">
                  We're committed to serving our local community with personalized service and 
                  building lasting relationships.
                </p>
              </Card>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <Card>
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Get In Touch</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Contact Details */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Phone</p>
                          <p className="text-gray-600">(201) 713-1850</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Email</p>
                          <p className="text-gray-600">info@gharkakhana.com</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Location</p>
                          <p className="text-gray-600">Glen Allen, Virginia</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Business Hours</h5>
                      <div className="space-y-2 text-gray-600">
                        <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                        <p>Saturday: 10:00 AM - 6:00 PM</p>
                        <p>Sunday: 11:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form/Buttons */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Ready to Order?</h4>
                    <p className="text-gray-600 mb-6">
                      Get in touch with us to discuss your catering needs, place an order, or ask any questions. 
                      We're here to help make your event special!
                    </p>
                    
                    <div className="space-y-4">
                      <Button
                        onClick={() => window.open("https://wa.me/12017131850", "_blank")}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        size="lg"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Order via WhatsApp
                      </Button>
                      
                      <Button
                        onClick={() => window.open("tel:+12017131850", "_blank")}
                        variant="outline"
                        className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                        size="lg"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call Us Directly
                      </Button>
                      
                      <Button
                        onClick={() => window.open("mailto:info@gharkakhana.com", "_blank")}
                        variant="outline"
                        className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                        size="lg"
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Why Choose Us */}
          <section>
            <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold mb-6 text-center">Why Choose Ghar Ka Khana?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Authentic Home Cooking</h4>
                        <p className="text-orange-100">Traditional recipes passed down through generations</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Fresh Ingredients</h4>
                        <p className="text-orange-100">Only the finest, freshest ingredients in every dish</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Personalized Service</h4>
                        <p className="text-orange-100">Customized menus for your specific needs and preferences</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Reliable Delivery</h4>
                        <p className="text-orange-100">On-time delivery and professional presentation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Local Community</h4>
                        <p className="text-orange-100">Serving Glen Allen and surrounding areas with pride</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Affordable Excellence</h4>
                        <p className="text-orange-100">Premium quality at reasonable prices</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-orange-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Thank you for choosing Ghar Ka Khana for your catering needs
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </div>
  )
}

export default AboutUs
