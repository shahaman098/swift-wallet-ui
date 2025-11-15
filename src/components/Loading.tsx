import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
}

const Loading = ({ text = "Loading..." }: LoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

export default Loading;
