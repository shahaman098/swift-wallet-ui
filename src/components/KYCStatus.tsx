import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, AlertCircle, Clock, CheckCircle2, Upload, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface KYCStatusData {
  kycStatus: 'pending' | 'verified' | 'rejected' | 'requires_documents';
  kybStatus: 'pending' | 'verified' | 'rejected' | 'requires_documents';
  kycVerifiedAt?: string;
  kybVerifiedAt?: string;
  sanctionsCheckStatus: 'pending' | 'clear' | 'flagged';
  sanctionsCheckAt?: string;
  requiresAction: boolean;
  message?: string;
}

const KYCStatus = () => {
  const [status, setStatus] = useState<KYCStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/kyc-kyb/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(response.data);
    } catch (error: any) {
      console.error('Failed to load KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'rejected':
      case 'flagged':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      verified: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      flagged: 'destructive',
      clear: 'default',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="ml-2">
        {status}
      </Badge>
    );
  };

  const handleSubmitKYC = () => {
    toast({
      title: "KYC Submission",
      description: "Please contact support to submit KYC documents.",
    });
  };

  const handleSubmitKYB = () => {
    toast({
      title: "KYB Submission",
      description: "Please contact support to submit KYB documents.",
    });
  };

  if (loading) {
    return (
      <Card className="liquid-glass-premium border-0 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  const allVerified = status.kycStatus === 'verified' && 
                      status.kybStatus === 'verified' && 
                      status.sanctionsCheckStatus === 'clear';
  
  const hasIssues = status.kycStatus === 'rejected' || 
                    status.kybStatus === 'rejected' || 
                    status.sanctionsCheckStatus === 'flagged';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="liquid-glass-premium border-0 shadow-xl">
        <CardHeader 
          className="cursor-pointer hover:bg-primary/5 transition-colors py-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ShieldCheck className={`h-5 w-5 ${allVerified ? 'text-success' : hasIssues ? 'text-destructive' : 'text-muted-foreground'}`} />
              Compliance & Verification
            </CardTitle>
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="space-y-4 pt-0">
          {status.requiresAction && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {status.message || 'Action required: Please complete your verification.'}
              </AlertDescription>
            </Alert>
          )}

          {/* KYC Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.kycStatus)}
              <div>
                <p className="font-semibold">KYC (Know Your Customer)</p>
                <p className="text-sm text-muted-foreground">
                  {status.kycVerifiedAt
                    ? `Verified ${new Date(status.kycVerifiedAt).toLocaleDateString()}`
                    : 'Individual identity verification'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(status.kycStatus)}
              {status.kycStatus !== 'verified' && (
                <Button size="sm" onClick={handleSubmitKYC}>
                  <Upload className="h-4 w-4 mr-1" />
                  Submit
                </Button>
              )}
            </div>
          </div>

          {/* KYB Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.kybStatus)}
              <div>
                <p className="font-semibold">KYB (Know Your Business)</p>
                <p className="text-sm text-muted-foreground">
                  {status.kybVerifiedAt
                    ? `Verified ${new Date(status.kybVerifiedAt).toLocaleDateString()}`
                    : 'Business entity verification'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(status.kybStatus)}
              {status.kybStatus !== 'verified' && (
                <Button size="sm" onClick={handleSubmitKYB}>
                  <Upload className="h-4 w-4 mr-1" />
                  Submit
                </Button>
              )}
            </div>
          </div>

          {/* Sanctions Screening */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.sanctionsCheckStatus)}
              <div>
                <p className="font-semibold">Sanctions Screening</p>
                <p className="text-sm text-muted-foreground">
                  {status.sanctionsCheckAt
                    ? `Last checked ${new Date(status.sanctionsCheckAt).toLocaleDateString()}`
                    : 'Compliance screening status'}
                </p>
              </div>
            </div>
            {getStatusBadge(status.sanctionsCheckStatus)}
          </div>

          {/* Transaction Limits Info */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold mb-2">Transaction Limits</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unverified: $1,000 per transaction</li>
              <li>• KYC Verified: $10,000 per transaction</li>
              <li>• KYC + KYB Verified: $100,000 per transaction</li>
            </ul>
          </div>
        </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default KYCStatus;

