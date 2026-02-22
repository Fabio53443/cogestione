import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { studenti, corsi, professori, iscrizioni, siteConfig } from "$lib/db/models";
import { eq, ilike, or, sql, count, asc, desc } from "drizzle-orm";
import { isAdmin } from "$lib/isAdmin";
import { getConfig } from "$lib/config";

export async function GET({ params, locals, url }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sort') || '';
    const sortOrder = url.searchParams.get('order') || 'asc';
    const offset = (page - 1) * limit;

    const orderFn = sortOrder === 'desc' ? desc : asc;

    // Map sort column names to DB columns
    function getStudentOrderBy(col) {
      const map = { id: studenti.id, nomeCompleto: studenti.nomeCompleto, classe: studenti.classe, email: studenti.email, sdo: studenti.sdo };
      return map[col] ? orderFn(map[col]) : null;
    }
    function getCourseOrderBy(col) {
      const map = { id: corsi.id, nome: corsi.nome, aula: corsi.aula };
      return map[col] ? orderFn(map[col]) : null;
    }
    function getTeacherOrderBy(col) {
      const map = { id: professori.id, nomeCompleto: professori.nomeCompleto, email: professori.email };
      return map[col] ? orderFn(map[col]) : null;
    }

    let items = [];
    let total = 0;

    switch (params.type) {
      case "students":
        // Get site config to determine total hours/days
        const config = await getConfig();
        const enabledDays = config?.days?.filter(d => d.enabled) || [];
        const enabledHours = config?.hours?.filter(h => h.enabled) || [];
        const numDays = enabledDays.length || 5;
        const numHours = enabledHours.length || 5;
        const totalSlots = numDays * numHours;
        const studentOrder = sortBy !== 'holes' ? getStudentOrderBy(sortBy) : null;

        if (search) {
          const searchPattern = `%${search}%`;
          const [countResult] = await db
            .select({ count: count() })
            .from(studenti)
            .where(or(
              ilike(studenti.nomeCompleto, searchPattern),
              ilike(studenti.email, searchPattern),
              ilike(studenti.classe, searchPattern)
            ));
          total = countResult.count;

          const studentQuery = db
            .select()
            .from(studenti)
            .where(or(
              ilike(studenti.nomeCompleto, searchPattern),
              ilike(studenti.email, searchPattern),
              ilike(studenti.classe, searchPattern)
            ));
          if (studentOrder) studentQuery.orderBy(studentOrder);
          items = await studentQuery.limit(limit).offset(offset);
        } else {
          const [countResult] = await db.select({ count: count() }).from(studenti);
          total = countResult.count;
          const studentQuery = db.select().from(studenti);
          if (studentOrder) studentQuery.orderBy(studentOrder);
          items = await studentQuery.limit(limit).offset(offset);
        }

        // For each student, calculate holes
        const studentIds = items.map(s => s.id);
        if (studentIds.length > 0) {
          // Get all enrollments for these students with course length
          const enrollmentsWithCourses = await db
            .select({
              idStudente: iscrizioni.idStudente,
              ora: iscrizioni.ora,
              giorno: iscrizioni.giorno,
              corsoLength: corsi.length
            })
            .from(iscrizioni)
            .innerJoin(corsi, eq(iscrizioni.idCorso, corsi.id))
            .where(sql`${iscrizioni.idStudente} IN (${sql.join(studentIds.map(id => sql`${id}`), sql`, `)})`);

          // Calculate holes for each student
          items = items.map(student => {
            const studentEnrollments = enrollmentsWithCourses.filter(e => e.idStudente === student.id);
            
            // Build coverage matrix
            const covered = {};
            for (let d = 0; d < numDays; d++) {
              covered[d] = {};
              for (let h = 0; h < numHours; h++) {
                covered[d][h] = false;
              }
            }

            // Mark covered slots
            studentEnrollments.forEach(e => {
              const courseLength = e.corsoLength || 1;
              for (let i = 0; i < courseLength; i++) {
                if (e.giorno < numDays && e.ora + i < numHours) {
                  covered[e.giorno][e.ora + i] = true;
                }
              }
            });

            // Count holes
            let holes = 0;
            for (let d = 0; d < numDays; d++) {
              for (let h = 0; h < numHours; h++) {
                if (!covered[d][h]) holes++;
              }
            }

            return { ...student, holes };
          });
        }

        // Sort by holes (computed field) — need to sort after computation
        if (sortBy === 'holes') {
          items.sort((a, b) => sortOrder === 'asc' ? (a.holes || 0) - (b.holes || 0) : (b.holes || 0) - (a.holes || 0));
        }
        break;
      case "courses":
        const courseOrder = getCourseOrderBy(sortBy);
        if (search) {
          const searchPattern = `%${search}%`;
          const [courseCount] = await db
            .select({ count: count() })
            .from(corsi)
            .where(or(
              ilike(corsi.nome, searchPattern),
              ilike(corsi.descrizione, searchPattern),
              ilike(corsi.aula, searchPattern)
            ));
          total = courseCount.count;
          const courseQuery = db
            .select()
            .from(corsi)
            .where(or(
              ilike(corsi.nome, searchPattern),
              ilike(corsi.descrizione, searchPattern),
              ilike(corsi.aula, searchPattern)
            ));
          if (courseOrder) courseQuery.orderBy(courseOrder);
          items = await courseQuery.limit(limit).offset(offset);
        } else {
          const [courseCount] = await db.select({ count: count() }).from(corsi);
          total = courseCount.count;
          const courseQuery = db.select().from(corsi);
          if (courseOrder) courseQuery.orderBy(courseOrder);
          items = await courseQuery.limit(limit).offset(offset);
        }
        break;
      case "teachers":
        const teacherOrder = getTeacherOrderBy(sortBy);
        if (search) {
          const searchPattern = `%${search}%`;
          const [teacherCount] = await db
            .select({ count: count() })
            .from(professori)
            .where(or(
              ilike(professori.nomeCompleto, searchPattern),
              ilike(professori.email, searchPattern)
            ));
          total = teacherCount.count;
          const teacherQuery = db
            .select()
            .from(professori)
            .where(or(
              ilike(professori.nomeCompleto, searchPattern),
              ilike(professori.email, searchPattern)
            ));
          if (teacherOrder) teacherQuery.orderBy(teacherOrder);
          items = await teacherQuery.limit(limit).offset(offset);
        } else {
          const [teacherCount] = await db.select({ count: count() }).from(professori);
          total = teacherCount.count;
          const teacherQuery = db.select().from(professori);
          if (teacherOrder) teacherQuery.orderBy(teacherOrder);
          items = await teacherQuery.limit(limit).offset(offset);
        }
        break;
      default:
        return json(
          { success: false, message: "Invalid type" },
          { status: 400 }
        );
    }

    return json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Admin API Error:", error);
    return json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
