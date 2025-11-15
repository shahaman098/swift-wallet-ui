import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Send } from "lucide-react";

const ActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        onClick={() => navigate('/add-money')}
        className="h-auto py-6 flex flex-col gap-2 bg-accent hover:bg-accent/90"
      >
        <ArrowDownToLine className="h-6 w-6" />
        <span className="text-base font-semibold">Add Money</span>
      </Button>
      
      <Button 
        onClick={() => navigate('/send-payment')}
        className="h-auto py-6 flex flex-col gap-2"
      >
        <Send className="h-6 w-6" />
        <span className="text-base font-semibold">Send Payment</span>
      </Button>
    </div>
  );
};

export default ActionButtons;
