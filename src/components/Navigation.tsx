import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dumbbell, Menu, X } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-semibold text-foreground">FitAI</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild className="hover:scale-105 transition-transform">
            <Link to="/login">Login</Link>
          </Button>
          <Button size="sm" asChild className="hover:scale-105 transition-transform">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-surface rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link to="/about" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/features" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/contact" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <div className="flex space-x-3 pt-2">
              <Button variant="ghost" size="sm" asChild className="flex-1">
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};