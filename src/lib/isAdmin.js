import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';
import { eq } from 'drizzle-orm';

export async function isAdmin(locals) 
{
    if (!locals.user) {
        return false;
    }
    
    const user = await db.select({
        admin: studenti.admin
    }).from(studenti).where(eq(studenti.id, locals.user.id));
    if (!user[0].admin ) {
        return false; 
    }

    return true; 
    
}
export async function isSdO(locals) 
{
    if (!locals.user) {
        return false;
    }  
    
    const user = await db.select({
        sdo: studenti.sdo
    }).from(studenti).where(eq(studenti.id, locals.user.id));
    if (!user[0].sdo ) {
        return false; 
    }

    return true; 
    
}
