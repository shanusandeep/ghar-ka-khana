
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import StarterItems from "./pages/StarterItems";
import MainCourse from "./pages/MainCourse";
import Breads from "./pages/Breads";
import Rice from "./pages/Rice";
import Dessert from "./pages/Dessert";
import RecipeFinder from "./pages/RecipeFinder";
import AdminDashboard from "./pages/AdminDashboard";
import LoginForm from "./components/LoginForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/starter-items" element={<StarterItems />} />
        <Route path="/main-course" element={<MainCourse />} />
        <Route path="/breads" element={<Breads />} />
        <Route path="/rice" element={<Rice />} />
        <Route path="/dessert" element={<Dessert />} />
        <Route path="/recipe-finder" element={<RecipeFinder />} />
        
        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={user ? <AdminDashboard /> : <LoginForm />} 
        />
        <Route 
          path="/login" 
          element={user ? <AdminDashboard /> : <LoginForm />} 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
