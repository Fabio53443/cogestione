<script>
  export let data;
  const { user, corsi, error, siteConfig, isSdO, sdoCanTakeAttendance } = data;
  import Alert from "$lib/components/Alert.svelte";
  
  // Get enabled days from config
  $: giorni = siteConfig?.days?.filter(d => d.enabled).map(d => d.name) || ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];
  
  const navigateToRegistration = () => {
    window.location.href = '/studente/corsi';
  };

  const unenroll = async (idCorso, giorno, ora) => {
    try {
      const response = await fetch('/api/studenti/enroll', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idCorso, giorno, ora })
      });

      const result = await response.json();
      if (result.success) {
        location.reload();
      } else {
        alert(`Unenrollment failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Unenrollment Error:', error);
      alert('Unenrollment failed.');
    }
  };
  
  // Get hour label from config
  function getHourLabel(hourIndex) {
    const hour = enabledHours[hourIndex];
    return hour ? hour.label : `${hourIndex + 1}°`;
  }
  
  $: coursesPerDay = corsi.reduce((acc, corso) => {
    const day = corso.giorno;
    if (!acc[day]) acc[day] = [];
    acc[day].push(corso);
    return acc;
  }, {});
</script>
<div class="max-w-4xl mx-auto px-4">
  {#if isSdO}
    <div class="bg-[#252536] rounded-2xl p-5 mb-6 border border-[#FB773C]/50">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-[#FB773C]/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
          </div>
          <div>
            <h3 class="text-white font-semibold">Servizio d'Ordine</h3>
            <p class="text-gray-400 text-sm">Sei parte del servizio d'ordine</p>
          </div>
        </div>
        {#if sdoCanTakeAttendance}
          <a href="/sdo/appello" class="inline-flex items-center justify-center bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#FB773C]/20">
            Fai l'appello
          </a>
        {/if}
      </div>
    </div>
  {/if}
  
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <h1 class="text-2xl md:text-3xl font-bold text-white">I tuoi corsi</h1>
    <a href="/studente/corsi" class="inline-flex items-center justify-center bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#FB773C]/20">
      + Iscriviti ai corsi
    </a>
  </div>

  {#if error}
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
      {error}
    </div>
  {:else if corsi.length === 0}
    <div class="bg-[#252536] rounded-2xl p-8 md:p-12 text-center border border-gray-700/50">
      <div class="w-16 h-16 bg-[#FB773C]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
      </div>
      <p class="text-gray-300 text-lg mb-6">Non sei ancora iscritto a nessun corso</p>
      <a href="/studente/corsi" class="inline-flex items-center gap-2 bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
        Sfoglia i corsi
      </a>
    </div>
  {:else}
    <div class="space-y-6">
      {#each Object.entries(coursesPerDay) as [day, dayCourses] (day)}
        <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
          <div class="bg-[#FB773C]/10 border-b border-gray-700/50 px-5 py-3">
            <h3 class="text-lg font-semibold text-[#FB773C]">{giorni[parseInt(day)] || `Giorno ${parseInt(day) + 1}`}</h3>
          </div>
          <div class="p-4 space-y-3">
            {#each dayCourses.sort((a, b) => a.ora - b.ora) as corso (corso.uniqueKey)}
              <div class="bg-[#1e1e2e] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center justify-center min-w-16 h-10 px-3 bg-green-500/20 text-green-400 font-bold text-sm rounded-xl whitespace-nowrap">
                    {getHourLabel(corso.ora)}
                  </span>
                </div>
                <div class="flex-grow min-w-0">
                  <h4 class="text-white font-semibold truncate">{corso.nome}</h4>
                  <p class="text-gray-400 text-sm truncate">{corso.descrizione}</p>
                  <p class="text-gray-500 text-sm mt-1">Aula: <span class="text-gray-300">{corso.aula}</span></p>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  {#if corso.presente}
                    <span class="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Presente
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1.5 bg-gray-600/30 text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      In attesa
                    </span>
                  {/if}
                  <button
                    class="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    on:click={() => unenroll(corso.id, corso.giorno, corso.ora)}
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>