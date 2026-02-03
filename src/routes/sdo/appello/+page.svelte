<script>
  import AttendanceModal from '$lib/components/AttendanceModal.svelte';
  
  export let data;
  const { corsi, siteConfig, error } = data;

  // Get enabled days and hours from config
  $: enabledDays = siteConfig?.days?.filter(d => d.enabled) || [];
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];

  // Filters
  let selectedDay = null;
  let selectedHour = null;
  let searchQuery = '';

  // Attendance modal
  let showAttendanceModal = false;
  let selectedStudents = [];
  let currentCourse = null;
  let currentHour = null;
  let currentDay = null;

  // Filter courses based on selection
  $: filteredCorsi = corsi.filter(corso => {
    // Search filter
    if (searchQuery && !corso.nome.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !corso.docenteNome?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Day filter
    if (selectedDay !== null && !corso.availability?.includes(selectedDay)) {
      return false;
    }
    
    // Hour filter - check if course has slots for that hour
    if (selectedHour !== null && selectedDay !== null) {
      const schedule = corso.schedule?.[selectedDay];
      if (!schedule || schedule[selectedHour] === undefined || schedule[selectedHour] <= 0) {
        // Check if it's available at this hour (not fully booked or has enrollments)
        // We show it anyway to allow taking attendance
      }
    }
    
    return true;
  });

  function getHourLabel(hourIndex) {
    const hour = enabledHours[hourIndex];
    return hour ? hour.label : `${hourIndex + 1}° ora`;
  }

  async function openAttendanceModal(corso, dayIndex, hourIndex) {
    currentCourse = corso;
    currentHour = hourIndex;
    currentDay = dayIndex;
    
    try {
      const response = await fetch(`/api/studenti/attendance/${corso.id}?hour=${currentHour}&day=${currentDay}`);
      if (response.ok) {
        selectedStudents = await response.json();
        showAttendanceModal = true;
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
    }
  }

  function handleAttendanceUpdate(updated) {
    if (Array.isArray(updated)) {
      updated.forEach(u => {
        selectedStudents = selectedStudents.map(student => 
          student.id === u.id ? u : student
        );
      });
    } else {
      selectedStudents = selectedStudents.map(student => 
        student.id === updated.id ? updated : student
      );
    }
  }

  function closeModal() {
    showAttendanceModal = false;
    selectedStudents = [];
    currentCourse = null;
  }
</script>

<div class="max-w-6xl mx-auto px-4">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl md:text-3xl font-bold text-white">Appello</h1>
      <p class="text-gray-400 mt-1">Seleziona giorno, ora e corso per fare l'appello</p>
    </div>
  </div>

  {#if error}
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
      {error}
    </div>
  {/if}

  <!-- Filters -->
  <div class="bg-[#252536] rounded-2xl p-6 mb-6 border border-gray-700/50">
    <h2 class="text-lg font-semibold text-white mb-4">Filtri</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Day selector -->
      <div>
        <label for="day-select" class="block text-gray-400 text-sm mb-2">Giorno</label>
        <select
          id="day-select"
          bind:value={selectedDay}
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FB773C] transition-colors"
        >
          <option value={null}>Tutti i giorni</option>
          {#each enabledDays as day}
            <option value={day.id}>{day.name}</option>
          {/each}
        </select>
      </div>

      <!-- Hour selector -->
      <div>
        <label for="hour-select" class="block text-gray-400 text-sm mb-2">Ora</label>
        <select
          id="hour-select"
          bind:value={selectedHour}
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FB773C] transition-colors"
        >
          <option value={null}>Tutte le ore</option>
          {#each enabledHours as hour, index}
            <option value={index}>{hour.label}</option>
          {/each}
        </select>
      </div>

      <!-- Search -->
      <div>
        <label for="search-input" class="block text-gray-400 text-sm mb-2">Cerca corso</label>
        <input
          id="search-input"
          type="text"
          bind:value={searchQuery}
          placeholder="Nome corso o docente..."
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors"
        />
      </div>
    </div>
  </div>

  <!-- Course list -->
  {#if selectedDay !== null && selectedHour !== null}
    <div class="grid gap-4">
      {#each filteredCorsi as corso}
        {@const hasEnrollments = corso.schedule?.[selectedDay]?.[selectedHour] > 0}
        <div class="bg-[#252536] rounded-2xl p-5 border border-gray-700/50 hover:border-gray-600 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-grow">
              <h3 class="text-lg font-semibold text-white">{corso.nome}</h3>
              <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                {#if corso.docenteNome}
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {corso.docenteNome}
                  </span>
                {/if}
                {#if corso.aula}
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    Aula {corso.aula}
                  </span>
                {/if}
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {corso.schedule?.[selectedDay]?.[selectedHour] || 0}/{corso.numPosti} iscritti
                </span>
              </div>
            </div>
            <button
              class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200 flex items-center gap-2"
              on:click={() => openAttendanceModal(corso, selectedDay, selectedHour)}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              Fai Appello
            </button>
          </div>
        </div>
      {:else}
        <div class="text-center py-12 text-gray-400 bg-[#252536] rounded-2xl border border-gray-700/50">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Nessun corso trovato per i filtri selezionati</p>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-12 text-gray-400 bg-[#252536] rounded-2xl border border-gray-700/50">
      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-lg font-medium text-white mb-2">Seleziona giorno e ora</p>
      <p>Per visualizzare i corsi e fare l'appello, seleziona prima un giorno e un'ora dai filtri sopra.</p>
    </div>
  {/if}
</div>

<AttendanceModal
  show={showAttendanceModal}
  students={selectedStudents}
  onClose={closeModal}
  onUpdateAttendance={handleAttendanceUpdate}
/>
