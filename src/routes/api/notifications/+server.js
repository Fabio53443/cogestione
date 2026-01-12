import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { notifications } from "$lib/db/models";
import { eq, desc, and } from "drizzle-orm";

// GET - Fetch active notifications for the current user based on visibility
export async function GET({ locals }) {
  try {
    const user = locals.user;
    
    // Get all active notifications
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.active, true))
      .orderBy(desc(notifications.createdAt));

    // Filter based on visibility and user role
    const visibleNotifications = allNotifications.filter(notification => {
      switch (notification.visibility) {
        case "everyone":
          return true;
        case "signed_in":
          return !!user;
        case "studenti":
          return user?.role === "studente";
        case "docenti":
          return user?.role === "docente";
        default:
          return false;
      }
    });

    return json({ success: true, notifications: visibleNotifications });
  } catch (error) {
    console.error("Public Notifications API Error:", error);
    return json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
