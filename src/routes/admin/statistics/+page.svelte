<script>
  import { onMount } from 'svelte';
  
  export let data;
  const { siteConfig } = data;
  
  let statistics = null;
  let loading = true;
  let error = null;
  
  $: enabledDays = siteConfig?.days?.filter(d => d.enabled) || [];
  
  onMount(async () => {
    try {
      const response = await fetch('/api/admin/statistics');
      const result = await response.json();
      if (result.success) {
        statistics = result.statistics;
      } else {
        error = result.message;
      }
    } catch (e) {
      error = 'Errore nel caricamento delle statistiche';
    }
    loading = false;
  });
  
  function getAttendanceColor(rate) {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    if (rate >= 40) return 'text-orange-400';
    return 'text-red-400';
  }
  
  function getBarColor(rate) {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }
</script>

<div class="max-w-7xl mx-auto px-4">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <h1 class="text-2xl md:text-3xl font-bold text-white">Statistiche</h1>
    <div class="flex flex-wrap gap-2">
      <a 
        href="/admin" 
        class="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-2.5 px-5 rounded-xl border border-gray-700 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
        Torna all'admin
      </a>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-[#FB773C] border-t-transparent"></div>
    </div>
  {:else if error}
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
      {error}
    </div>
  {:else if statistics}
    <!-- Overview Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-[#252536] rounded-2xl p-5 border border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
          <span class="text-gray-400 text-sm">Studenti</span>
        </div>
        <p class="text-3xl font-bold text-white">{statistics.overview.totalStudents}</p>
      </div>
      
      <div class="bg-[#252536] rounded-2xl p-5 border border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <span class="text-gray-400 text-sm">Corsi</span>
        </div>
        <p class="text-3xl font-bold text-white">{statistics.overview.totalCourses}</p>
      </div>
      
      <div class="bg-[#252536] rounded-2xl p-5 border border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <span class="text-gray-400 text-sm">Organizzatori</span>
        </div>
        <p class="text-3xl font-bold text-white">{statistics.overview.totalTeachers}</p>
      </div>
      
      <div class="bg-[#252536] rounded-2xl p-5 border border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <span class="text-gray-400 text-sm">Iscrizioni</span>
        </div>
        <p class="text-3xl font-bold text-white">{statistics.overview.totalEnrollments}</p>
      </div>
    </div>

    <!-- Overall Attendance -->
    <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50 mb-8">
      <h2 class="text-xl font-bold text-white mb-4">Presenze Globali</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="text-center">
          <p class="text-4xl font-bold {getAttendanceColor(statistics.attendance.overallRate)}">{statistics.attendance.overallRate}%</p>
          <p class="text-gray-400 text-sm mt-1">Tasso presenze</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-400">{statistics.attendance.present}</p>
            <p class="text-gray-400 text-sm">Presenti</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-red-400">{statistics.attendance.absent}</p>
            <p class="text-gray-400 text-sm">Assenti</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-400">{statistics.attendance.notRecorded}</p>
            <p class="text-gray-400 text-sm">Non registrati</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance by Day -->
    <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50 mb-8">
      <h2 class="text-xl font-bold text-white mb-4">Presenze per Giorno</h2>
      <div class="space-y-4">
        {#each statistics.attendanceByDay as day}
          <div class="bg-[#1e1e2e] rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-white font-medium">{day.dayName}</span>
              <span class="{getAttendanceColor(day.attendanceRate)} font-bold">{day.attendanceRate}%</span>
            </div>
            <div class="h-3 rounded-full bg-gray-700 overflow-hidden mb-2">
              <div class="h-full {getBarColor(day.attendanceRate)} transition-all duration-500" style="width: {day.attendanceRate}%"></div>
            </div>
            <div class="flex gap-4 text-xs text-gray-400">
              <span class="text-green-400">✓ {day.present} presenti</span>
              <span class="text-red-400">✗ {day.absent} assenti</span>
              <span class="text-gray-500">? {day.notRecorded} non registrati</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Worst Courses -->
      <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
          Corsi con più assenze
        </h2>
        {#if statistics.worstCourses.length === 0}
          <p class="text-gray-400 text-center py-4">Nessun dato disponibile</p>
        {:else}
          <div class="space-y-3">
            {#each statistics.worstCourses as course, i}
              <div class="flex items-center gap-3 bg-[#1e1e2e] rounded-xl p-3">
                <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 font-bold text-sm">{i + 1}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-medium truncate">{course.nome}</p>
                  <p class="text-gray-500 text-xs">Aula {course.aula} • {course.totalEnrollments} iscrizioni</p>
                </div>
                <div class="text-right">
                  <p class="text-red-400 font-bold">{course.absenceRate}%</p>
                  <p class="text-gray-500 text-xs">assenze</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Best Courses -->
      <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          Corsi con più Presenze
        </h2>
        {#if statistics.bestCourses.length === 0}
          <p class="text-gray-400 text-center py-4">Nessun dato disponibile</p>
        {:else}
          <div class="space-y-3">
            {#each statistics.bestCourses as course, i}
              <div class="flex items-center gap-3 bg-[#1e1e2e] rounded-xl p-3">
                <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/20 text-green-400 font-bold text-sm">{i + 1}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-medium truncate">{course.nome}</p>
                  <p class="text-gray-500 text-xs">Aula {course.aula} • {course.totalEnrollments} iscrizioni</p>
                </div>
                <div class="text-right">
                  <p class="text-green-400 font-bold">{course.attendanceRate}%</p>
                  <p class="text-gray-500 text-xs">presenze</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Students with Most Absences -->
      <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Studenti con più assenze
        </h2>
        {#if statistics.studentsWithMostAbsences.length === 0}
          <p class="text-gray-400 text-center py-4">Nessuna assenza registrata</p>
        {:else}
          <div class="space-y-3">
            {#each statistics.studentsWithMostAbsences as student, i}
              <a href="/admin/studenti/{student.id}" class="flex items-center gap-3 bg-[#1e1e2e] rounded-xl p-3 hover:bg-[#2a2a3e] transition-colors">
                <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 font-bold text-sm">{i + 1}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-medium truncate">{student.nomeCompleto}</p>
                  <p class="text-gray-500 text-xs">{student.classe || 'Nessuna classe'}</p>
                </div>
                <div class="text-right">
                  <p class="text-red-400 font-bold">{student.absences}</p>
                  <p class="text-gray-500 text-xs">assenze</p>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Least Popular Courses -->
      <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
          Corsi meno Popolari
        </h2>
        {#if statistics.leastPopularCourses.length === 0}
          <p class="text-gray-400 text-center py-4">Nessun dato disponibile</p>
        {:else}
          <div class="space-y-3">
            {#each statistics.leastPopularCourses as course, i}
              <a href="/admin/corsi/{course.id}" class="flex items-center gap-3 bg-[#1e1e2e] rounded-xl p-3 hover:bg-[#2a2a3e] transition-colors">
                <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold text-sm">{i + 1}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-medium truncate">{course.nome}</p>
                  <p class="text-gray-500 text-xs">Aula {course.aula}</p>
                </div>
                <div class="text-right">
                  <p class="text-orange-400 font-bold">{course.totalEnrollments}</p>
                  <p class="text-gray-500 text-xs">iscrizioni</p>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Courses per Hour -->
      <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Corsi per Fascia Oraria
        </h2>
        {#if statistics.coursesPerHour.length === 0}
          <p class="text-gray-400 text-center py-4">Nessun dato disponibile</p>
        {:else}
          <div class="space-y-3">
            {#each statistics.coursesPerHour as hour}
              {@const maxCourses = Math.max(...statistics.coursesPerHour.map(h => h.courseCount))}
              {@const percentage = maxCourses > 0 ? (hour.courseCount / maxCourses) * 100 : 0}
              <div class="bg-[#1e1e2e] rounded-xl p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-white font-medium">{hour.hourName}</span>
                  <span class="text-blue-400 font-bold">{hour.courseCount} corsi</span>
                </div>
                <div class="h-2 rounded-full bg-gray-700 overflow-hidden">
                  <div class="h-full bg-blue-500 transition-all duration-500" style="width: {percentage}%"></div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Courses per Day -->
      <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Corsi per Giorno
        </h2>
        {#if statistics.coursesPerDay.length === 0}
          <p class="text-gray-400 text-center py-4">Nessun dato disponibile</p>
        {:else}
          <div class="space-y-3">
            {#each statistics.coursesPerDay as day}
              {@const maxCourses = Math.max(...statistics.coursesPerDay.map(d => d.courseCount))}
              {@const percentage = maxCourses > 0 ? (day.courseCount / maxCourses) * 100 : 0}
              <div class="bg-[#1e1e2e] rounded-xl p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-white font-medium">{day.dayName}</span>
                  <span class="text-cyan-400 font-bold">{day.courseCount} corsi</span>
                </div>
                <div class="h-2 rounded-full bg-gray-700 overflow-hidden">
                  <div class="h-full bg-cyan-500 transition-all duration-500" style="width: {percentage}%"></div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Most Popular Courses -->
      <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          Corsi più Popolari
        </h2>
        {#if statistics.mostPopularCourses.length === 0}
          <p class="text-gray-400 text-center py-4">Nessun corso disponibile</p>
        {:else}
          <div class="space-y-3">
            {#each statistics.mostPopularCourses as course, i}
              <a href="/admin/corsi/{course.id}" class="flex items-center gap-3 bg-[#1e1e2e] rounded-xl p-3 hover:bg-[#2a2a3e] transition-colors">
                <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold text-sm">{i + 1}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-medium truncate">{course.nome}</p>
                  <p class="text-gray-500 text-xs">Aula {course.aula}</p>
                </div>
                <div class="text-right">
                  <p class="text-purple-400 font-bold">{course.totalEnrollments}</p>
                  <p class="text-gray-500 text-xs">iscrizioni</p>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Placeholder for future stats or keep one side empty -->
      <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Riepilogo Veloce
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-[#1e1e2e] rounded-xl">
            <span class="text-gray-400">Corsi senza iscrizioni</span>
            <span class="text-yellow-400 font-bold">{statistics.leastPopularCourses.filter(c => c.totalEnrollments === 0).length}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-[#1e1e2e] rounded-xl">
            <span class="text-gray-400">Studenti con buchi</span>
            <span class="text-orange-400 font-bold">{statistics.studentsWithHoles.length > 0 ? statistics.studentsWithHoles.length + '+' : '0'}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-[#1e1e2e] rounded-xl">
            <span class="text-gray-400">Tasso presenze globale</span>
            <span class="{getAttendanceColor(statistics.attendance.overallRate)} font-bold">{statistics.attendance.overallRate}%</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-[#1e1e2e] rounded-xl">
            <span class="text-gray-400">Corsi con assenze > 30%</span>
            <span class="text-red-400 font-bold">{statistics.worstCourses.filter(c => c.absenceRate > 30).length}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
