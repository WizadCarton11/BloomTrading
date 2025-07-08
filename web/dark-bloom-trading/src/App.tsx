import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import LoginPage from "./pages/LoginPage";
// import NotFound from "./pages/NotFound";
// import Home from "./pages/Home";
import React, { Suspense, useEffect } from "react";
import ProtectedRoute from "./utils/ProtectedRoute";

const queryClient = new QueryClient();
const Index = React.lazy(() => import("./pages/Index"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Home = React.lazy(() => import("./pages/Home"));
const MarketPlace = React.lazy(() => import("./pages/StockMarketplace"));
const SingleStockPage = React.lazy(() => import("./pages/SingleStockPage"));
const CompareStocks = React.lazy(() => import("./pages/CompareStock"));
const Portfolio = React.lazy(() => import("./pages/PortfolioPage"));
const App = () => {
  useEffect(() => {
      // Add custom scrollbar styles
      const style = document.createElement("style");
      style.textContent = `
          ::-webkit-scrollbar {
            width: 10px;
            background-color: #111827; /* dark background */
          }
          
          ::-webkit-scrollbar-thumb {
            background-color: #6366F1; /* indigo color, assuming your theme */
            border-radius: 5px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background-color: #4F46E5; /* darker on hover */
          }
          
          /* For Firefox */
          * {
            scrollbar-width: thin;
            scrollbar-color: #6366F1 #111827;
          }
        `;
      document.head.appendChild(style);
  
      return () => {
        document.head.removeChild(style);
      };
    }, []);
  return (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center align-middle h-screen">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/marketplace" element={<MarketPlace />} />
            <Route path="/stock/:stockSymbol" element={<SingleStockPage />} />
            <Route path="/compare/:symbols" element={<CompareStocks />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </TooltipProvider>
);
}
export default App;
