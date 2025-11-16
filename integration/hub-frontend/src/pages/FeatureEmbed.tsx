import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Resolve base paths from environment (Vite or CRA-style)
const BASE_PATH =
  (import.meta as any)?.env?.VITE_BASE_PATH ||
  (import.meta as any)?.env?.REACT_APP_BASE_PATH ||
  "";

// Track URLs from environment (preferred), with sensible fallbacks
const ENV_TRACK2_URL =
  (import.meta as any)?.env?.VITE_TRACK2_URL ||
  (import.meta as any)?.env?.REACT_APP_TRACK2_URL ||
  "/apps/track2/frontend/dist/index.html";
const ENV_TRACK3_URL =
  (import.meta as any)?.env?.VITE_TRACK3_URL ||
  (import.meta as any)?.env?.REACT_APP_TRACK3_URL ||
  "/apps/track3/frontend/dist/index.html";
const ENV_TRACK1_URL =
  (import.meta as any)?.env?.VITE_TRACK1_URL ||
  (import.meta as any)?.env?.REACT_APP_TRACK1_URL ||
  "/apps/track1/index.html";

// Helper: Resolve a track URL based on environment
function resolveTrackUrl(app: string): string | null {
  const isDev = (import.meta as any)?.env?.DEV ?? false;
  // Development: prefer relative paths so local file server can serve assets directly
  if (isDev) {
    switch (app) {
      case "bridge":
        return "../apps/track2/index.html";
      case "treasury":
        return "../apps/track3/frontend/index.html";
      case "contracts":
        return "../apps/track1/frontend/index.html";
      case "wallet":
        return "/dashboard";
      default:
        return null;
    }
  }
  // Production: prefer env URLs; prefix with base path if provided
  const withBase = (url: string) =>
    BASE_PATH && url.startsWith("/") ? `${BASE_PATH}${url}` : url;
  switch (app) {
    case "bridge":
      return withBase(ENV_TRACK2_URL);
    case "treasury":
      return withBase(ENV_TRACK3_URL);
    case "contracts":
      return withBase(ENV_TRACK1_URL);
    case "wallet":
      return withBase("/dashboard");
    default:
      return null;
  }
}

// Feature display names
const FEATURE_NAMES: Record<string, string> = {
  bridge: "Cross-Chain Bridge",
  treasury: "Treasury Automation",
  contracts: "Smart Contracts Playground",
  wallet: "Embedded Wallet",
};

const FeatureEmbed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const app = searchParams.get("app") || "";
  const [featureUrl, setFeatureUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const loadTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!app) {
      setError("No app parameter specified");
      return;
    }

    const url = resolveTrackUrl(app);
    if (!url) {
      setError(`Unknown feature: ${app}`);
      return;
    }

    setError(null);
    setLoadFailed(false);
    setIsLoading(true);
    setFeatureUrl(url);

    // Fallback if iframe doesn't load within timeout
    if (loadTimeoutRef.current) {
      window.clearTimeout(loadTimeoutRef.current);
    }
    loadTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      setLoadFailed(true);
    }, 8000);

    return () => {
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [app]);

  const handleOpenNewTab = () => {
    if (featureUrl) {
      // Open in new tab - adjust path based on your setup
      window.open(featureUrl, "_blank");
    }
  };

  const featureName = FEATURE_NAMES[app] || app;
  const showIframe = useMemo(
    () => Boolean(featureUrl) && !error,
    [featureUrl, error],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative">
      {/* Global Back to Dashboard button - fixed top-left */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <Navbar minimal />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-arc-gradient">{featureName}</h1>
          </div>
          {featureUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenNewTab}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          )}
        </div>

        {error ? (
          <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-destructive text-lg mb-4">{error}</p>
                <Button onClick={() => navigate("/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : showIframe ? (
          <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {!loadFailed && (
                <iframe
                  src={featureUrl as string}
                  className="w-full h-[100vh] border-0"
                  title={featureName}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  loading="eager"
                  onLoad={() => {
                    setIsLoading(false);
                    if (loadTimeoutRef.current) {
                      window.clearTimeout(loadTimeoutRef.current);
                    }
                  }}
                />
              )}
              {(isLoading || loadFailed) && (
                <div className="w-full h-[100vh] flex flex-col items-center justify-center gap-4">
                  <p className="text-muted-foreground">
                    {isLoading ? "Loading feature..." : "We couldn't load this feature."}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      onClick={() => {
                        // Force reload logic
                        setIsLoading(true);
                        setLoadFailed(false);
                        // Re-assign the same URL to re-trigger load
                        setFeatureUrl((prev) => (prev ? `${prev}` : prev));
                      }}
                    >
                      Reload
                    </Button>
                    {featureUrl && (
                      <Button variant="outline" onClick={handleOpenNewTab} className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading feature...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeatureEmbed;

