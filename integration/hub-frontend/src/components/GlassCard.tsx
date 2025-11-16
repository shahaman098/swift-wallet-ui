import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

interface GlassCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const GlassCard = ({ title, description, children, className = "" }: GlassCardProps) => {
  return (
    <Card className={`liquid-glass border-0 fade-in ${className}`}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default GlassCard;

