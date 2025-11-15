import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl shadow-sm"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg"
          >
            <Wallet className="h-6 w-6 text-white" />
          </motion.div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            PayWallet
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <Link to="/treasury">Treasury Brain</Link>
              </Button>
            </motion.div>
          )}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
