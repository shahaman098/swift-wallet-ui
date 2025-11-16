import { motion } from "framer-motion";

interface LoadingProps {
  text?: string;
}

const Loading = ({ text = "Loading..." }: LoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            background: "linear-gradient(135deg, #4A44F2 0%, #31D2F7 100%)",
          }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-background"
          animate={{
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default Loading;
