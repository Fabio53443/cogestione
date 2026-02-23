import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { presenze_logs, studenti, corsi, professori } from '$lib/db/models';
import { eq, and, gte, lte, desc, ilike, or } from 'drizzle-orm';
import { isAdmin } from '$lib/isAdmin';

export async function GET({ url, locals }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // sanitize pagination params to avoid NaN
  let page = Number(url.searchParams.get('page')) || 1;
  page = Number.isInteger(page) && page > 0 ? page : 1;
  let perPage = Number(url.searchParams.get('perPage')) || 50;
  perPage = Number.isInteger(perPage) && perPage > 0 ? perPage : 50;
  const studentIdRaw = url.searchParams.get('studentId');
  const studentId = studentIdRaw ? Number(studentIdRaw) : null;
  const q = url.searchParams.get('q')?.trim();
  const classe = url.searchParams.get('classe');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const whereClauses = [];

  if (studentIdRaw && Number.isInteger(studentId)) {
    whereClauses.push(eq(presenze_logs.id_studente, studentId));
  }

  if (q) {
    const pattern = `%${q}%`;
    whereClauses.push(or(
      ilike(studenti.nomeCompleto, pattern),
      ilike(studenti.email, pattern),
      ilike(professori.nomeCompleto, pattern),
      ilike(professori.email, pattern),
      ilike(corsi.nome, pattern)
    ));
  }

  // Note: classe filter requires joining with studenti table
  let base = db.select({
    id: presenze_logs.id,
    id_iscrizione: presenze_logs.id_iscrizione,
    id_studente: presenze_logs.id_studente,
    student_name: studenti.nomeCompleto,
    classe: studenti.classe,
    id_corso: presenze_logs.id_corso,
    course_name: corsi.nome,
    giorno: presenze_logs.giorno,
    ora: presenze_logs.ora,
    previous_presente: presenze_logs.previous_presente,
    new_presente: presenze_logs.new_presente,
    changed_by: presenze_logs.changed_by,
    changed_by_student: studenti.nomeCompleto,
    changed_by_prof: professori.nomeCompleto,
    reason: presenze_logs.reason,
    created_at: presenze_logs.created_at,
  })
  .from(presenze_logs)
  .leftJoin(studenti, eq(presenze_logs.id_studente, studenti.id))
  .leftJoin(corsi, eq(presenze_logs.id_corso, corsi.id))
  .leftJoin(professori, eq(presenze_logs.changed_by, professori.id));

  if (whereClauses.length) {
    base = base.where(and(...whereClauses));
  }

  if (classe) {
    base = base.where(eq(studenti.classe, classe));
  }

  if (from) {
    base = base.where(gte(presenze_logs.created_at, from));
  }
  if (to) {
    base = base.where(lte(presenze_logs.created_at, to));
  }

  const offset = (page - 1) * perPage;

  const results = await base.orderBy(desc(presenze_logs.id)).limit(perPage).offset(offset);

  return json({ success: true, logs: results, page, perPage });
}
