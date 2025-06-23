import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import LoginPage from "./pages/LoginPage";
// import NotFound from "./pages/NotFound";
// import Home from "./pages/Home";
import React, { Suspense } from "react";

const queryClient = new QueryClient();
const Index= React.lazy(() => import("./pages/Index"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Home = React.lazy(() => import("./pages/Home"));
const App = () => (
  
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center align-middle h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<Home/>}/>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  
);

export default App;
