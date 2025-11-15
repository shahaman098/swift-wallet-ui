import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full p-1 transition-colors duration-300 liquid-glass-premium hover-lift"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(74, 68, 242, 0.2), rgba(49, 210, 247, 0.2))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(240, 240, 240, 0.4))',
      }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #4A44F2, #31D2F7)'
            : 'linear-gradient(135deg, #FDB813, #FFA000)',
        }}
        animate={{
          x: theme === 'dark' ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-white" />
        ) : (
          <Sun className="w-4 h-4 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
