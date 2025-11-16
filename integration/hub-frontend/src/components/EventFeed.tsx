import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle2, Clock, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Event {
  id: string;
  type: string;
  txHash: string;
  timestamp: string;
  status: "completed" | "pending";
  details?: string;
}

interface EventFeedProps {
  events: Event[];
}

const EventFeed = ({ events }: EventFeedProps) => {
  const getEventIcon = (type: string) => {
    if (type.includes("Bridge")) return <ArrowRightLeft className="h-4 w-4" />;
    if (type.includes("Distribution")) return <CheckCircle2 className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <Card className="liquid-glass border-0 fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Event Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events yet</p>
              <p className="text-sm mt-2">Events will appear here as you interact with the platform</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 liquid-glass rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.type)}
                      <span className="font-semibold text-sm">{event.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted" />
                      )}
                      <span className="text-xs text-muted">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-secondary break-all">
                    {event.txHash}
                  </div>
                  {event.details && (
                    <div className="text-xs text-muted">{event.details}</div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EventFeed;

