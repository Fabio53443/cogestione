import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';
import { eq } from 'drizzle-orm';
import { getConfig, setConfigValue, setMultipleConfigValues, initializeConfig, invalidateConfigCache } from '$lib/config';

// GET - Retrieve all config
export async function GET({ locals }) {
  try {
    const config = await getConfig();
    return json({ success: true, config });
  } catch (error) {
    console.error('Config GET Error:', error);
    return json({ success: false, message: 'Failed to load config' }, { status: 500 });
  }
}

// POST - Update config (admin only)
export async function POST({ request, locals }) {
  // Check if user is admin
  if (!locals.user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db
      .select({ admin: studenti.admin })
      .from(studenti)
      .where(eq(studenti.id, locals.user.id));

    if (!user[0]?.admin) {
      return json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    
    // Handle single key update
    if (body.key && body.value !== undefined) {
      const result = await setConfigValue(body.key, body.value);
      return json(result);
    }
    
    // Handle multiple updates
    if (body.updates && typeof body.updates === 'object') {
      const result = await setMultipleConfigValues(body.updates);
      return json(result);
    }

    return json({ success: false, message: 'Invalid request body' }, { status: 400 });
  } catch (error) {
    console.error('Config POST Error:', error);
    return json({ success: false, message: 'Failed to update config' }, { status: 500 });
  }
}

// PUT - Initialize config with defaults (admin only)
export async function PUT({ locals }) {
  if (!locals.user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db
      .select({ admin: studenti.admin })
      .from(studenti)
      .where(eq(studenti.id, locals.user.id));

    if (!user[0]?.admin) {
      return json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const result = await initializeConfig();
    return json(result);
  } catch (error) {
    console.error('Config PUT Error:', error);
    return json({ success: false, message: 'Failed to initialize config' }, { status: 500 });
  }
}
