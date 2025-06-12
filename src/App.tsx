import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StarterItems from "./pages/StarterItems";
import MainCourse from "./pages/MainCourse";
import Breads from "./pages/Breads";
import Rice from "./pages/Rice";
import Dessert from "./pages/Dessert";
import RecipeFinder from "./pages/RecipeFinder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/starter-items" element={<StarterItems />} />
          <Route path="/main-course" element={<MainCourse />} />
          <Route path="/breads" element={<Breads />} />
          <Route path="/rice" element={<Rice />} />
          <Route path="/dessert" element={<Dessert />} />
          <Route path="/recipe-finder" element={<RecipeFinder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
