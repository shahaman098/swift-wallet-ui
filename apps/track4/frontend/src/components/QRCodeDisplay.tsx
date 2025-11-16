import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  link: string;
  size?: number;
  className?: string;
}

const QRCodeDisplay = ({ link, size = 200, className }: QRCodeDisplayProps) => {
  const [qrUrl, setQrUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const generate = async () => {
      try {
        const url = await QRCode.toDataURL(link, {
          width: size,
          margin: 1,
          color: {
            dark: "#0F172A",
            light: "#ffffff",
          },
        });
        if (isMounted) {
          setQrUrl(url);
        }
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    };
    if (link) {
      generate();
    }
    return () => {
      isMounted = false;
    };
  }, [link, size]);

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "Payment request link copied to clipboard.",
    });
  };

  const shareLink = async () => {
    if (!navigator.share) {
      copyLink();
      return;
    }
    try {
      await navigator.share({
        title: "Payment Request",
        text: "Complete this payment request",
        url: link,
      });
    } catch (error) {
      copyLink();
    }
  };

  if (!link) return null;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {qrUrl && (
        <img
          src={qrUrl}
          alt="Payment request QR"
          className="rounded-xl border border-white/20 shadow-lg"
          width={size}
          height={size}
        />
      )}
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2" onClick={copyLink}>
          <Copy className="h-4 w-4" />
          Copy
        </Button>
        <Button className="gap-2" onClick={shareLink}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;

