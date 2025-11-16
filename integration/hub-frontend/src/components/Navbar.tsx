import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthProvider";

type NavbarProps = {
  minimal?: boolean;
};

const Navbar = ({ minimal = false }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
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
            <img src="/arc.svg" alt="Arc" className="h-6 w-6" />
          </motion.div>
          {!minimal && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Noah’s Arc
            </span>
          )}
        </Link>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && !minimal && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <Link to="/dashboard">Command Bridge</Link>
              </Button>
            </motion.div>
          )}
          {isAuthenticated && !minimal && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <Link to="/add-money">Add Money</Link>
              </Button>
            </motion.div>
          )}
          {isAuthenticated && !minimal && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <Link to="/feature?app=contracts">Programmable Money Studio</Link>
              </Button>
            </motion.div>
          )}
          {isAuthenticated && !minimal && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <Link to="/treasury">Treasury Engine</Link>
              </Button>
            </motion.div>
          )}
          {isAuthenticated && !minimal && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <Link to="/send-payment">Payments</Link>
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
                {!minimal && (
                  <span className="hidden sm:inline font-medium">Logout</span>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
