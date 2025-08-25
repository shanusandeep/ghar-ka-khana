
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Plus, Package, ClipboardList, Users, BarChart3, Home, DollarSign } from 'lucide-react'
import OrderManagement from '@/components/OrderManagement'
import MenuManagement from '@/components/MenuManagement'
import PreparationDashboard from '@/components/PreparationDashboard'
import CustomerManagement from '@/components/CustomerManagement'
import FinancialDashboard from '@/components/FinancialDashboard'
import ErrorBoundary from '@/components/ErrorBoundary'


const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('orders')

  // Handle edit context from navigation state
  useEffect(() => {
    if (location.state?.editItem) {
      // Switch to menu tab when editing an item
      setActiveTab('menu')
    }
  }, [location.state])

  const handleSignOut = async () => {
    await signOut()
  }



  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-16 md:pb-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-orange-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl text-gray-900">Ghar Ka Khana</h1>
                  <p className="text-sm text-orange-600">Admin Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end space-x-4">
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                    className="flex items-center space-x-2"
                  >
                    <Link to="/">
                      <Home className="w-4 h-4" />
                      <span className="hidden xs:inline">Home</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden xs:inline">Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 lg:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Desktop Tab Navigation - Hidden on mobile */}
            <TabsList className="hidden md:grid w-full grid-cols-5 h-auto p-1">
              <TabsTrigger value="orders" className="flex items-center justify-center gap-2 p-3">
                <ClipboardList className="w-4 h-4" />
                <span>Orders</span>
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center justify-center gap-2 p-3">
                <Package className="w-4 h-4" />
                <span>Menu</span>
              </TabsTrigger>
              <TabsTrigger value="preparation" className="flex items-center justify-center gap-2 p-3">
                <BarChart3 className="w-4 h-4" />
                <span>Preparation</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center justify-center gap-2 p-3">
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center justify-center gap-2 p-3">
                <DollarSign className="w-4 h-4" />
                <span>Financial</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              <ErrorBoundary>
                <OrderManagement />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="menu" className="space-y-6">
              <ErrorBoundary>
                <MenuManagement 
                  editItem={location.state?.editItem}
                  editCategory={location.state?.category}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="preparation" className="space-y-6">
              <ErrorBoundary>
                <PreparationDashboard />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <ErrorBoundary>
                <CustomerManagement />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <ErrorBoundary>
                <FinancialDashboard />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
          <div className="grid grid-cols-5 h-16">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'orders' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-xs font-medium">Orders</span>
            </button>
            
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'menu' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-xs font-medium">Menu</span>
            </button>
            
            <button
              onClick={() => setActiveTab('preparation')}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'preparation' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-medium">Prep</span>
            </button>
            
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'customers' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium">Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('financial')}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'financial' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-medium">Finance</span>
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default AdminDashboard
