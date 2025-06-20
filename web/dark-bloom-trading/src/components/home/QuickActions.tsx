
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Bell, Settings, BarChart3, Calculator } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Add to Watchlist",
      description: "Track your favorite stocks",
      icon: Plus,
      color: "bg-emerald-600 hover:bg-emerald-700"
    },
    {
      title: "Market Research",
      description: "Analyze market trends",
      icon: Search,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Set Price Alerts",
      description: "Get notified on price changes",
      icon: Bell,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Portfolio Analytics",
      description: "View detailed performance",
      icon: BarChart3,
      color: "bg-orange-600 hover:bg-orange-700"
    },
    {
      title: "Options Calculator",
      description: "Calculate option strategies",
      icon: Calculator,
      color: "bg-pink-600 hover:bg-pink-700"
    },
    {
      title: "Account Settings",
      description: "Manage your preferences",
      icon: Settings,
      color: "bg-gray-600 hover:bg-gray-700"
    }
  ];

  return (
    <section className="py-12 px-6 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action) => (
            <Card key={action.title} className="bg-gray-800 border-gray-700 hover:border-emerald-500 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color} transition-colors`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">{action.description}</p>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
