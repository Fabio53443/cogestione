<script>
  import AttendanceModal from '$lib/components/AttendanceModal.svelte';
  import { goto } from '$app/navigation';
  export let data;
  const { corso, error, siteConfig } = data;
  
  // Get enabled days and hours from config
  $: days = siteConfig?.days?.filter(d => d.enabled).map(d => d.name) || ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];

  let showAttendanceModal = false;
  let selectedStudents = [];
  let currentHour;
  let currentDay;
  let currentCourseLength = 1;

  function barColor(free, total) {
    return free === 0 ? 'bg-red-500' : 'bg-green-500';
  }
  
  function getHourLabel(hourIndex) {
    const hour = enabledHours[hourIndex];
    return hour ? hour.label : `${hourIndex + 1}°`;
  }

  function getOccupancy(hourSeats) {
    return corso.numPosti - (hourSeats ?? 0);
  }

  function getOccupancyColor(hourSeats) {
    const occupied = hourSeats ?? 0;
    const percentage = (occupied / corso.numPosti) * 100;
    if (percentage > 80) return 'text-green-400';
    if (percentage > 50) return 'text-orange-400';
    return 'text-red-400';
  }

  async function openAttendanceModal(dayIndex, timeIndex) {
    currentHour = timeIndex;
    currentDay = dayIndex;
    const response = await fetch(`/api/studenti/attendance/${corso.id}?hour=${currentHour}&day=${currentDay}`);
    if (response.ok) {
      const data = await response.json();
      selectedStudents = data.students || data;
      currentCourseLength = data.courseLength || 1;
      showAttendanceModal = true;
    }
  }

  function handleAttendanceUpdate(updatedStudent) {
    // Handle both single and array updates
    if (Array.isArray(updatedStudent)) {
      updatedStudent.forEach(updated => {
        selectedStudents = selectedStudents.map(student => 
          student.id === updated.id ? updated : student
        );
      });
    } else {
      selectedStudents = selectedStudents.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      );
    }
  }
</script>

{#if error}
  <div class="max-w-4xl mx-auto px-4">
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
      {error}
    </div>
  </div>
{:else if corso}
  <div class="max-w-4xl mx-auto px-4">
    <!-- Back button -->
    <a href="/docenti/courses" class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Torna ai corsi
    </a>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-white">{corso.nome}</h1>
      <button 
        class="inline-flex items-center justify-center gap-2 bg-[#FB773C] hover:bg-[#EB3678] text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200"
        on:click={() => goto(`/docenti/courses/${corso.id}/edit`)}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        Modifica
      </button>
    </div>

    <!-- Course Info Card -->
    <div class="bg-[#252536] rounded-2xl p-6 mb-6 border border-gray-700/50">
      <p class="text-gray-300 mb-6">{corso.descrizione}</p>
      <div class="flex flex-wrap gap-3">
        <span class="inline-flex items-center gap-2 bg-[#1e1e2e] text-gray-300 px-4 py-2 rounded-xl">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          Aula {corso.aula}
        </span>
        <span class="inline-flex items-center gap-2 bg-[#1e1e2e] text-gray-300 px-4 py-2 rounded-xl">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {corso.length} {corso.length === 1 ? 'ora' : 'ore'}
        </span>
        <span class="inline-flex items-center gap-2 bg-[#1e1e2e] text-gray-300 px-4 py-2 rounded-xl">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          {corso.numPosti} posti
        </span>
      </div>
    </div>

    {#if corso.schedule && corso.availability}
      <!-- Schedule by Day -->
      <div class="space-y-6">
        {#each days as day, dayIndex}
          {#if corso.availability.includes(dayIndex)}
            <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
              <div class="bg-[#FB773C]/10 border-b border-gray-700/50 px-5 py-4">
                <h2 class="text-lg font-semibold text-[#FB773C]">{day}</h2>
              </div>
              
              <!-- Desktop Table -->
              <div class="hidden md:block p-4">
                <table class="w-full">
                  <thead>
                    <tr class="text-gray-500 text-sm">
                      <th class="py-2 w-24 text-left">Turno</th>
                      <th class="py-2 text-left">Posti liberi</th>
                      <th class="py-2 w-32 text-center">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each Array(Math.floor(corso.schedule[dayIndex].length / corso.length)) as _, groupIndex}
                      {@const timeIndex = groupIndex * corso.length}
                      {@const hourSeats = corso.schedule[dayIndex][timeIndex] ?? 0}
                      <tr class="border-t border-gray-700/50">
                        <td class="py-3">
                          <span class="text-white font-medium">
                            {#if corso.length > 1}
                              {getHourLabel(timeIndex)} - {getHourLabel(timeIndex + corso.length - 1)}
                            {:else}
                              {getHourLabel(timeIndex)}
                            {/if}
                          </span>
                        </td>
                        <td class="py-3 pr-4">
                          <div class="flex items-center gap-4">
                            <span class="text-sm font-bold min-w-[60px] {getOccupancyColor(hourSeats)}">
                              {hourSeats}/{corso.numPosti}
                            </span>
                            <div class="flex-1 h-2 rounded-full bg-gray-700 overflow-hidden">
                              <div
                                class="h-full transition-all duration-300 {barColor(getOccupancy(hourSeats), corso.numPosti)}"
                                style="width: {((hourSeats / corso.numPosti) * 100)}%;"
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td class="py-3 text-center">
                          <button
                            class="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium py-1.5 px-4 rounded-lg transition-colors text-sm"
                            on:click={() => openAttendanceModal(dayIndex, timeIndex)}
                          >
                            Presenze
                          </button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>

              <!-- Mobile Cards -->
              <div class="md:hidden p-3 space-y-2">
                {#each Array(Math.floor(corso.schedule[dayIndex].length / corso.length)) as _, groupIndex}
                  {@const timeIndex = groupIndex * corso.length}
                  {@const hourSeats = corso.schedule[dayIndex][timeIndex] ?? 0}
                  <div class="bg-[#1e1e2e] rounded-xl p-4">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-white font-semibold">
                        {#if corso.length > 1}
                          {getHourLabel(timeIndex)} - {getHourLabel(timeIndex + corso.length - 1)}
                        {:else}
                          {getHourLabel(timeIndex)}
                        {/if}
                      </span>
                      <span class="text-sm font-bold {getOccupancyColor(hourSeats)}">
                        {hourSeats}/{corso.numPosti}
                      </span>
                    </div>
                    <div class="h-2 rounded-full bg-gray-700 overflow-hidden mb-4">
                      <div
                        class="h-full transition-all duration-300 {barColor(getOccupancy(hourSeats), corso.numPosti)}"
                        style="width: {((hourSeats / corso.numPosti) * 100)}%;"
                      ></div>
                    </div>
                    <button
                      class="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                      on:click={() => openAttendanceModal(dayIndex, timeIndex)}
                    >
                      Presenze
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
  <AttendanceModal
    show={showAttendanceModal}
    students={selectedStudents}
    onClose={() => showAttendanceModal = false}
    onUpdateAttendance={handleAttendanceUpdate}
    courseId={corso.id}
    courseLength={currentCourseLength}
    courseName={corso.nome}
  />
{/if}