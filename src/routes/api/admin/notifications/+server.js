import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { notifications } from "$lib/db/models";
import { eq, desc } from "drizzle-orm";
import { isAdmin } from "$lib/isAdmin";

// GET - Fetch all notifications (admin only)
export async function GET({ locals }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allNotifications = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));

    return json({ success: true, notifications: allNotifications });
  } catch (error) {
    console.error("Notifications API Error:", error);
    return json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new notification
export async function POST({ locals, request }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, message, type, visibility } = await request.json();

    if (!title || !message) {
      return json({ success: false, message: "Title and message are required" }, { status: 400 });
    }

    const validTypes = ["info", "warning", "error", "success"];
    const validVisibilities = ["everyone", "signed_in", "studenti", "docenti"];

    if (type && !validTypes.includes(type)) {
      return json({ success: false, message: "Invalid notification type" }, { status: 400 });
    }

    if (visibility && !validVisibilities.includes(visibility)) {
      return json({ success: false, message: "Invalid visibility" }, { status: 400 });
    }

    const [newNotification] = await db
      .insert(notifications)
      .values({
        title,
        message,
        type: type || "info",
        visibility: visibility || "everyone",
      })
      .returning();

    return json({ success: true, notification: newNotification });
  } catch (error) {
    console.error("Create Notification Error:", error);
    return json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update a notification
export async function PUT({ locals, request }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, message, type, visibility, active } = await request.json();

    if (!id) {
      return json({ success: false, message: "Notification ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (type !== undefined) updateData.type = type;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (active !== undefined) updateData.active = active;

    const [updated] = await db
      .update(notifications)
      .set(updateData)
      .where(eq(notifications.id, id))
      .returning();

    if (!updated) {
      return json({ success: false, message: "Notification not found" }, { status: 404 });
    }

    return json({ success: true, notification: updated });
  } catch (error) {
    console.error("Update Notification Error:", error);
    return json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a notification
export async function DELETE({ locals, request }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return json({ success: false, message: "Notification ID is required" }, { status: 400 });
    }

    await db.delete(notifications).where(eq(notifications.id, id));

    return json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
