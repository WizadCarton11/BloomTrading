
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-electric-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">DarkBloom</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-electric-400 transition-colors">
              Features
            </a>
            <a href="#platform" className="text-muted-foreground hover:text-electric-400 transition-colors">
              Platform
            </a>
            <a href="#about" className="text-muted-foreground hover:text-electric-400 transition-colors">
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-electric-400 transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground hover:text-electric-400">
              Login
            </Button>
            <Button className="bg-electric-600 hover:bg-electric-700 text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
