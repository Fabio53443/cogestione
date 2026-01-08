<script>
  import Alert from '$lib/components/Alert.svelte';
  import { goto } from '$app/navigation';
  export let data;
  const { corso, error, iscrizioni, enrolmentDict, siteConfig } = data;
  
  // Get enabled days and hours from config
  $: days = siteConfig?.days?.filter(d => d.enabled).map(d => d.name) || ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];
  $: numHours = enabledHours.length || 5;
  
  let showAlert = false;
  let alertMessage = '';
  let alertType = '';

  async function enroll(dayIndex, timeIndex) {
    const response = await fetch('/api/studenti/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idCorso: corso.id,
        giorno: dayIndex,
        ora: timeIndex
      })
    });

    const result = await response.json();

    if (response.ok) {
      alertType = 'success';
      alertMessage = 'Iscrizione avvenuta con successo';
      showAlert = true;
      //refresh the page
      location.reload();

    } else {
      alertType = 'error';
      alertMessage = `Errore: ${result.message}`;
      showAlert = true;
    }
  }

  async function unenroll(dayIndex, timeIndex) {
    const response = await fetch('/api/studenti/enroll', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idCorso: corso.id,
        giorno: dayIndex,
        ora: timeIndex
      })
    });

    const result = await response.json();

    if (response.ok) {
      alertType = 'success';
      alertMessage = 'Disiscrizione avvenuta con successo';
      showAlert = true;
      location.reload();
    } else {
      alertType = 'error';
      alertMessage = `Errore: ${result.message}`;
      showAlert = true;
    }
  }

  function barColor(free, total) {
    return free === 0 ? 'bg-red-500' : 'bg-green-500';
  }

  function canEnroll(dayIndex, timeIndex) {
    const courseLength = corso.length;
    if (timeIndex + courseLength > numHours) return false; // Ensure the course can fit in the day's schedule
    if (!corso.schedule || !corso.schedule[dayIndex]) return false;
    for (let i = 0; i < courseLength; i++) {
      if (corso.schedule[dayIndex][timeIndex + i] === undefined) return false;
    }
    return true;
  }
  
  function getHourLabel(hourIndex) {
    const hour = enabledHours[hourIndex];
    return hour ? hour.label : `${hourIndex + 1}°`;
  }

  function computeFreeSeats(dayIndex, timeIndex) {
    let usedSeats = 0;
    for (let i = 0; i < corso.length; i++) {
      usedSeats += corso.schedule[dayIndex][timeIndex + i] ?? 0;
    }
    if (corso.length > 1) {
      usedSeats/=corso.length;
    }
    return usedSeats; 
  }

  function getSeatsColor(free, total) {
    const percentage = (free / total) * 100;
    if (percentage > 66) return 'text-green-400';
    if (percentage > 33) return 'text-orange-400';
    return 'text-red-400';
  }

  function getEnrollmentStatus(dayIndex, timeIndex) {
    // First check if enrolled in this course
    if (enrolmentDict.find(item => item.day === dayIndex && item.hour === timeIndex && item.id === corso.id)) {
      return 'enrolled';
      
    }
    
    // Then check if enrolled in any other course at this time or in the timeslot if it's a multihour course
    const conflictingEnrollment = enrolmentDict.find(item => {
      if (corso.length > 1) {
        return item.day === dayIndex && item.hour >= timeIndex && item.hour < timeIndex + corso.length;
      }
      return item.day === dayIndex && item.hour === timeIndex;
    });
    
    // If there's a conflict and it's not with the current course
    if (conflictingEnrollment && conflictingEnrollment.idCorso !== corso.id) {
      return 'conflict';
    }
    
    if (computeFreeSeats(dayIndex, timeIndex) === 0) {
      return 'full';
    }
    
    return 'available';
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
    <Alert type={alertType} message={alertMessage} show={showAlert} on:close={() => showAlert = false} />
    
    <!-- Back button -->
    <a href="/studente/corsi" class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Torna ai corsi
    </a>
    
    <h1 class="text-2xl md:text-3xl font-bold text-white mb-6">{corso.nome}</h1>
    
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
      <!-- Schedule - Desktop Table -->
      <div class="hidden md:block bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
        <div class="bg-[#FB773C]/10 border-b border-gray-700/50 px-5 py-4">
          <h2 class="text-lg font-semibold text-[#FB773C]">Disponibilità</h2>
        </div>
        <div class="p-4">
          <table class="w-full">
            <thead>
              <tr>
                <th class="text-left text-gray-500 text-sm font-medium p-3">Ora</th>
                {#each days as day}
                  <th class="text-left text-gray-500 text-sm font-medium p-3">{day.slice(0, 3)}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each Array(numHours - corso.length + 1).fill(0).map((_, i) => i).filter(i => i % corso.length === 0) as timeIndex}
                <tr>
                  <td class="p-3 text-gray-300 font-medium whitespace-nowrap">
                    {#if corso.length > 1}
                      {getHourLabel(timeIndex)} - {getHourLabel(timeIndex + corso.length - 1)}
                    {:else}
                      {getHourLabel(timeIndex)}
                    {/if}
                  </td>
                  {#each days as _, dayIndex}
                    <td class="p-2">
                      {#if corso.availability.includes(dayIndex) && canEnroll(dayIndex, timeIndex)}
                        {@const status = getEnrollmentStatus(dayIndex, timeIndex)}
                        {@const freeSeats = computeFreeSeats(dayIndex, timeIndex)}
                        <div class="bg-[#1e1e2e] rounded-xl p-3 min-w-[100px]">
                          <div class="flex items-center justify-between gap-2 mb-2">
                            <span class={`text-sm font-bold ${getSeatsColor(freeSeats, corso.numPosti)}`}>
                              {freeSeats}/{corso.numPosti}
                            </span>
                            {#if status === 'enrolled'}
                              <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                            {/if}
                          </div>
                          <div class="w-full h-1.5 rounded-full bg-gray-700 overflow-hidden mb-3">
                            <div
                              class={`h-full transition-all duration-300 ${barColor(freeSeats, corso.numPosti)}`}
                              style="width: {((freeSeats / corso.numPosti) * 100)}%;"
                            ></div>
                          </div>
                          <button
                            class={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200
                              ${status === 'enrolled' 
                                ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400' 
                                : status === 'conflict'
                                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                : status === 'full'
                                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                : 'bg-[#FB773C] hover:bg-[#EB3678] text-white'
                              }`}
                            on:click={() => status === 'enrolled'
                              ? unenroll(dayIndex, timeIndex) 
                              : enroll(dayIndex, timeIndex)}
                            disabled={!['enrolled', 'available'].includes(status)}
                          >
                            {#if status === 'enrolled'}
                              ✓ Iscritto
                            {:else if status === 'conflict'}
                              Occupato
                            {:else if status === 'full'}
                              Pieno
                            {:else}
                              Iscriviti
                            {/if}
                          </button>
                        </div>
                      {:else}
                        <div class="bg-[#1e1e2e]/50 rounded-xl p-3 min-w-[100px] h-full flex items-center justify-center">
                          <span class="text-gray-600 text-xs">—</span>
                        </div>
                      {/if}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Schedule - Mobile Cards -->
      <div class="md:hidden space-y-4">
        <h2 class="text-lg font-semibold text-[#FB773C]">Disponibilità</h2>
        {#each corso.availability.sort((a, b) => a - b) as dayIndex}
          <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
            <div class="bg-[#FB773C]/10 border-b border-gray-700/50 px-4 py-3">
              <h3 class="font-semibold text-white">{days[dayIndex]}</h3>
            </div>
            <div class="p-3 space-y-2">
              {#each Array(numHours - corso.length + 1).fill(0).map((_, i) => i).filter(i => i % corso.length === 0) as timeIndex}
                {#if canEnroll(dayIndex, timeIndex)}
                  {@const status = getEnrollmentStatus(dayIndex, timeIndex)}
                  {@const freeSeats = computeFreeSeats(dayIndex, timeIndex)}
                  <div class="bg-[#1e1e2e] rounded-xl p-4 flex items-center gap-4">
                    <div class="flex-shrink-0 text-center">
                      <span class="block text-white font-semibold text-sm">
                        {#if corso.length > 1}
                          {getHourLabel(timeIndex)}-{getHourLabel(timeIndex + corso.length - 1)}
                        {:else}
                          {getHourLabel(timeIndex)}
                        {/if}
                      </span>
                    </div>
                    <div class="flex-grow">
                      <div class="flex items-center gap-2 mb-1">
                        <span class={`text-sm font-bold ${getSeatsColor(freeSeats, corso.numPosti)}`}>
                          {freeSeats}/{corso.numPosti} posti
                        </span>
                        {#if status === 'enrolled'}
                          <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                        {/if}
                      </div>
                      <div class="w-full h-1.5 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          class={`h-full transition-all duration-300 ${barColor(freeSeats, corso.numPosti)}`}
                          style="width: {((freeSeats / corso.numPosti) * 100)}%;"
                        ></div>
                      </div>
                    </div>
                    <button
                      class={`flex-shrink-0 py-2 px-4 text-sm font-semibold rounded-xl transition-all duration-200
                        ${status === 'enrolled' 
                          ? 'bg-green-500/20 text-green-400' 
                          : status === 'conflict'
                          ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                          : status === 'full'
                          ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                          : 'bg-[#FB773C] hover:bg-[#EB3678] text-white'
                        }`}
                      on:click={() => status === 'enrolled'
                        ? unenroll(dayIndex, timeIndex) 
                        : enroll(dayIndex, timeIndex)}
                      disabled={!['enrolled', 'available'].includes(status)}
                    >
                      {#if status === 'enrolled'}
                        ✓
                      {:else if status === 'conflict'}
                        —
                      {:else if status === 'full'}
                        —
                      {:else}
                        +
                      {/if}
                    </button>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}