import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href")?.substring(1);
    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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
            <a href="#features" className="text-muted-foreground hover:text-electric-400 transition-colors" onClick={handleNavClick}>
              Features
            </a>
            <a href="#platform" className="text-muted-foreground hover:text-electric-400 transition-colors" onClick={handleNavClick}>
              Platform
            </a>
            <a href="#about" className="text-muted-foreground hover:text-electric-400 transition-colors" onClick={handleNavClick}>
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-electric-400 transition-colors" onClick={handleNavClick}>
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-electric-400">
                Login
              </Button>
            </Link>
            <Link to="/login?tab=signup">
              <Button className="bg-electric-600 hover:bg-electric-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
