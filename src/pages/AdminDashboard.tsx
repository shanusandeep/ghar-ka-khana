import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Plus, Package, ClipboardList, Users, BarChart3 } from 'lucide-react'
import OrderManagement from '@/components/OrderManagement'
import MenuManagement from '@/components/MenuManagement'
import PreparationDashboard from '@/components/PreparationDashboard'
import CustomerManagement from '@/components/CustomerManagement'

const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')

  const handleSignOut = async () => {
    await signOut()
  }

  return (
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tab Navigation - Hidden on mobile */}
          <TabsList className="hidden md:grid w-full grid-cols-4 h-auto p-1">
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
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="preparation" className="space-y-6">
            <PreparationDashboard />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="grid grid-cols-4 h-16">
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
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
