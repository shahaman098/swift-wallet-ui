import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// In-memory event store (in production, use database)
const events: any[] = [];

export const getEvents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sortedEvents = [...events].sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
    
    return res.json({
      success: true,
      events: sortedEvents,
    });
  } catch {
    return res.json({
      success: true,
      events: [],
    });
  }
};

// Export events array for adding events from other controllers
export { events };

