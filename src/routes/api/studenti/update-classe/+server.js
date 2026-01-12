import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';
import { eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
    if (!locals.user || locals.user.role !== 'studente') {
        return json({ success: false, message: 'Non autorizzato.' }, { status: 401 });
    }

    try {
        const { classe } = await request.json();

        if (!classe || classe.trim() === '') {
            return json({ success: false, message: 'La classe è obbligatoria.' }, { status: 400 });
        }

        await db.update(studenti)
            .set({ classe: classe.trim() })
            .where(eq(studenti.id, locals.user.id));

        return json({ success: true, message: 'Classe aggiornata con successo.' });
    } catch (error) {
        console.error('Error updating classe:', error);
        return json({ success: false, message: 'Errore durante l\'aggiornamento.' }, { status: 500 });
    }
}
