import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { studenti, corsi, professori, iscrizioni } from "$lib/db/models";
import { eq, sql, count, and, isNull, isNotNull } from "drizzle-orm";
import { isAdmin } from "$lib/isAdmin";
import { getConfig } from "$lib/config";

export async function GET({ locals }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await getConfig();
    const enabledDays = config?.days?.filter(d => d.enabled) || [];
    const enabledHours = config?.hours?.filter(h => h.enabled) || [];

    // Total counts
    const [studentCount] = await db.select({ count: count() }).from(studenti);
    const [courseCount] = await db.select({ count: count() }).from(corsi);
    const [teacherCount] = await db.select({ count: count() }).from(professori);
    const [enrollmentCount] = await db.select({ count: count() }).from(iscrizioni);

    // Attendance statistics
    const [presentCount] = await db
      .select({ count: count() })
      .from(iscrizioni)
      .where(eq(iscrizioni.presente, true));

    const [absentCount] = await db
      .select({ count: count() })
      .from(iscrizioni)
      .where(eq(iscrizioni.presente, false));

    const [notRecordedCount] = await db
      .select({ count: count() })
      .from(iscrizioni)
      .where(isNull(iscrizioni.presente));

    // Attendance by day
    // Note: iscrizioni.giorno stores the INDEX (0, 1, 2...) not the day.id
    const attendanceByDay = [];
    for (let i = 0; i < enabledDays.length; i++) {
      const day = enabledDays[i];
      const [dayPresent] = await db
        .select({ count: count() })
        .from(iscrizioni)
        .where(and(eq(iscrizioni.giorno, i), eq(iscrizioni.presente, true)));

      const [dayAbsent] = await db
        .select({ count: count() })
        .from(iscrizioni)
        .where(and(eq(iscrizioni.giorno, i), eq(iscrizioni.presente, false)));

      const [dayNotRecorded] = await db
        .select({ count: count() })
        .from(iscrizioni)
        .where(and(eq(iscrizioni.giorno, i), isNull(iscrizioni.presente)));

      const [dayTotal] = await db
        .select({ count: count() })
        .from(iscrizioni)
        .where(eq(iscrizioni.giorno, i));

      attendanceByDay.push({
        dayId: i,
        dayName: day.name,
        present: Number(dayPresent.count),
        absent: Number(dayAbsent.count),
        notRecorded: Number(dayNotRecorded.count),
        total: Number(dayTotal.count),
        attendanceRate: dayTotal.count > 0 
          ? Math.round((dayPresent.count / (dayPresent.count + dayAbsent.count || 1)) * 100) 
          : 0
      });
    }

    // Courses with worst attendance (highest absence rate)
    const courseStats = await db
      .select({
        id: corsi.id,
        nome: corsi.nome,
        aula: corsi.aula,
        totalEnrollments: count(iscrizioni.id),
      })
      .from(corsi)
      .leftJoin(iscrizioni, eq(corsi.id, iscrizioni.idCorso))
      .groupBy(corsi.id);

    // Get detailed attendance per course
    const courseAttendance = [];
    for (const course of courseStats) {
      const [present] = await db
        .select({ count: count() })
        .from(iscrizioni)
        .where(and(eq(iscrizioni.idCorso, course.id), eq(iscrizioni.presente, true)));

      const [absent] = await db
        .select({ count: count() })
        .from(iscrizioni)
        .where(and(eq(iscrizioni.idCorso, course.id), eq(iscrizioni.presente, false)));

      const [notRec] = await db
        .select({ count: count() })
        .from(iscrizioni)
        .where(and(eq(iscrizioni.idCorso, course.id), isNull(iscrizioni.presente)));

      const recorded = Number(present.count) + Number(absent.count);
      const absenceRate = recorded > 0 ? (Number(absent.count) / recorded) * 100 : 0;

      courseAttendance.push({
        id: course.id,
        nome: course.nome,
        aula: course.aula,
        totalEnrollments: Number(course.totalEnrollments),
        present: Number(present.count),
        absent: Number(absent.count),
        notRecorded: Number(notRec.count),
        absenceRate: Math.round(absenceRate * 10) / 10,
        attendanceRate: Math.round((100 - absenceRate) * 10) / 10
      });
    }

    // Sort by absence rate (worst first)
    const worstCourses = [...courseAttendance]
      .filter(c => c.totalEnrollments > 0)
      .sort((a, b) => b.absenceRate - a.absenceRate)
      .slice(0, 10);

    // Best courses (highest attendance)
    const bestCourses = [...courseAttendance]
      .filter(c => c.totalEnrollments > 0 && (c.present + c.absent) > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 10);

    // Students with most absences
    const studentAbsences = await db
      .select({
        id: studenti.id,
        nomeCompleto: studenti.nomeCompleto,
        classe: studenti.classe,
        absences: count(iscrizioni.id),
      })
      .from(studenti)
      .innerJoin(iscrizioni, and(
        eq(studenti.id, iscrizioni.idStudente),
        eq(iscrizioni.presente, false)
      ))
      .groupBy(studenti.id)
      .orderBy(sql`count(${iscrizioni.id}) DESC`)
      .limit(10);

    // Students with schedule holes (no enrollments for some slots)
    const numDays = enabledDays.length;
    const numHours = enabledHours.length;
    const totalSlots = numDays * numHours;

    const studentsWithHoles = await db
      .select({
        id: studenti.id,
        nomeCompleto: studenti.nomeCompleto,
        classe: studenti.classe,
        enrollments: count(iscrizioni.id),
      })
      .from(studenti)
      .leftJoin(iscrizioni, eq(studenti.id, iscrizioni.idStudente))
      .groupBy(studenti.id)
      .having(sql`count(${iscrizioni.id}) < ${totalSlots}`)
      .orderBy(sql`count(${iscrizioni.id}) ASC`)
      .limit(10);

    const holesData = studentsWithHoles.map(s => ({
      ...s,
      enrollments: Number(s.enrollments),
      holes: totalSlots - Number(s.enrollments)
    }));

    // Classes overview
    const classStats = await db
      .select({
        classe: studenti.classe,
        count: count(studenti.id),
      })
      .from(studenti)
      .where(isNotNull(studenti.classe))
      .groupBy(studenti.classe)
      .orderBy(studenti.classe);

    // Courses by capacity usage
    const capacityUsage = courseAttendance
      .map(c => ({
        ...c,
        capacityUsed: c.totalEnrollments > 0 ? Math.round((c.totalEnrollments / (c.totalEnrollments + 10)) * 100) : 0
      }))
      .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
      .slice(0, 10);

    // Least popular courses (fewest enrollments)
    const leastPopularCourses = [...courseAttendance]
      .sort((a, b) => a.totalEnrollments - b.totalEnrollments)
      .slice(0, 10);

    // Courses per time slot (hour distribution) - based on enrollments
    // Note: iscrizioni.ora stores the INDEX (0, 1, 2...) not the hour.id
    const coursesPerHour = [];
    for (let i = 0; i < enabledHours.length; i++) {
      const hour = enabledHours[i];
      // Count unique courses that have enrollments for this hour index
      const hourCourses = await db
        .selectDistinct({ idCorso: iscrizioni.idCorso })
        .from(iscrizioni)
        .where(eq(iscrizioni.ora, i));
      
      coursesPerHour.push({
        hourId: i,
        hourName: hour.label,
        courseCount: hourCourses.length
      });
    }

    // Courses per day (day distribution) - based on enrollments
    // Note: iscrizioni.giorno stores the INDEX (0, 1, 2...) not the day.id
    const coursesPerDay = [];
    for (let i = 0; i < enabledDays.length; i++) {
      const day = enabledDays[i];
      // Count unique courses that have enrollments for this day index
      const dayCourses = await db
        .selectDistinct({ idCorso: iscrizioni.idCorso })
        .from(iscrizioni)
        .where(eq(iscrizioni.giorno, i));
      
      coursesPerDay.push({
        dayId: i,
        dayName: day.name,
        courseCount: dayCourses.length
      });
    }

    // Calculate averages
    const avgEnrollmentsPerCourse = courseCount.count > 0 
      ? Math.round((Number(enrollmentCount.count) / Number(courseCount.count)) * 10) / 10 
      : 0;
    
    const avgCoursesPerStudent = studentCount.count > 0 
      ? Math.round((Number(enrollmentCount.count) / Number(studentCount.count)) * 10) / 10 
      : 0;

    // Enrollment fill rate (how full courses are on average)
    const coursesWithCapacity = courseAttendance.filter(c => c.totalEnrollments > 0);
    const avgFillRate = coursesWithCapacity.length > 0
      ? Math.round(coursesWithCapacity.reduce((acc, c) => acc + c.totalEnrollments, 0) / coursesWithCapacity.length)
      : 0;

    return json({
      success: true,
      statistics: {
        overview: {
          totalStudents: Number(studentCount.count),
          totalCourses: Number(courseCount.count),
          totalTeachers: Number(teacherCount.count),
          totalEnrollments: Number(enrollmentCount.count),
          avgEnrollmentsPerCourse,
          avgCoursesPerStudent,
          avgFillRate
        },
        attendance: {
          present: Number(presentCount.count),
          absent: Number(absentCount.count),
          notRecorded: Number(notRecordedCount.count),
          total: Number(enrollmentCount.count),
          overallRate: enrollmentCount.count > 0 
            ? Math.round((presentCount.count / (Number(presentCount.count) + Number(absentCount.count) || 1)) * 100)
            : 0
        },
        attendanceByDay,
        worstCourses,
        bestCourses,
        studentsWithMostAbsences: studentAbsences.map(s => ({
          ...s,
          absences: Number(s.absences)
        })),
        studentsWithHoles: holesData,
        mostPopularCourses: capacityUsage,
        leastPopularCourses,
        coursesPerHour,
        coursesPerDay
      }
    });
  } catch (error) {
    console.error("Statistics API Error:", error);
    return json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
