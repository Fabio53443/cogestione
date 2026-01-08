<script>
  export let data;
  const { studentId, siteConfig } = data;

  let student = null;
  let corsi = [];
  let loading = true;
  let error = null;

  // Get enabled days from config (same as student dashboard)
  $: giorni = siteConfig?.days?.filter(d => d.enabled).map(d => d.name) || ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
  $: enabledDays = siteConfig?.days?.filter(d => d.enabled) || [];
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];
  $: numHours = enabledHours.length || 5;

  // Get hour label from config (same as student dashboard)
  function getHourLabel(hourIndex) {
    const hour = enabledHours[hourIndex];
    return hour ? hour.label : `${hourIndex + 1}°`;
  }

  // Group by day (same logic as student dashboard)
  $: coursesPerDay = corsi.reduce((acc, corso) => {
    const day = corso.giorno;
    if (!acc[day]) acc[day] = [];
    acc[day].push(corso);
    return acc;
  }, {});

  // Count holes
  $: holesCount = (() => {
    let holes = 0;
    enabledDays.forEach(day => {
      const coveredHours = new Set();
      corsi.filter(c => c.giorno === day.id).forEach(c => {
        coveredHours.add(c.ora);
      });
      for (let h = 0; h < numHours; h++) {
        if (!coveredHours.has(h)) holes++;
      }
    });
    return holes;
  })();

  async function loadStudent() {
    loading = true;
    error = null;
    try {
      const response = await fetch(`/api/admin/studente/${studentId}`);
      const result = await response.json();
      if (result.success) {
        student = result.student;
        // Transform enrollments to match student dashboard format
        corsi = result.enrollments.map(e => ({
          id: e.idCorso,
          uniqueKey: `${e.idCorso}-${e.giorno}-${e.ora}`,
          nome: e.corsoNome,
          aula: e.corsoAula,
          ora: e.ora,
          giorno: e.giorno,
          presente: e.presente,
        }));
      } else {
        error = result.message;
      }
    } catch (e) {
      error = "Errore nel caricamento";
    }
    loading = false;
  }

  loadStudent();
</script>

<div class="max-w-4xl mx-auto px-4">
  <!-- Back button -->
  <a href="/admin" class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
    Torna all'admin
  </a>

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-[#FB773C] border-t-transparent"></div>
    </div>
  {:else if error}
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
      {error}
    </div>
  {:else if student}
    <!-- Student Info Card -->
    <div class="bg-[#252536] rounded-2xl p-6 mb-6 border border-gray-700/50">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div class="w-16 h-16 bg-[#FB773C]/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-2xl font-bold text-[#FB773C]">{student.nomeCompleto.charAt(0).toUpperCase()}</span>
        </div>
        <div class="flex-grow">
          <h1 class="text-2xl font-bold text-white">{student.nomeCompleto}</h1>
          <p class="text-gray-400">{student.email}</p>
          {#if student.classe}
            <span class="inline-flex items-center mt-2 bg-[#1e1e2e] text-gray-300 text-sm px-3 py-1 rounded-lg">
              Classe: {student.classe}
            </span>
          {/if}
        </div>
        <div class="flex gap-2">
          {#if student.sdo}
            <span class="bg-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1 rounded-lg">SdO</span>
          {/if}
          {#if student.admin}
            <span class="bg-purple-500/20 text-purple-400 text-xs font-medium px-3 py-1 rounded-lg">Admin</span>
          {/if}
        </div>
      </div>

      <!-- Schedule Status Summary -->
      <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-700/50">
        {#if holesCount === 0}
          <div class="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Orario completo
          </div>
        {:else}
          <div class="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {holesCount} {holesCount === 1 ? 'buco' : 'buchi'} nell'orario
          </div>
        {/if}
        <div class="flex items-center gap-2 bg-[#1e1e2e] text-gray-300 px-4 py-2 rounded-xl">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          {corsi.length} {corsi.length === 1 ? 'iscrizione' : 'iscrizioni'}
        </div>
      </div>
    </div>

    <!-- Courses by Day (same as student dashboard) -->
    {#if corsi.length === 0}
      <div class="bg-[#252536] rounded-2xl p-8 md:p-12 text-center border border-gray-700/50">
        <div class="w-16 h-16 bg-[#FB773C]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <p class="text-gray-300 text-lg">Nessuna iscrizione</p>
      </div>
    {:else}
      <div class="space-y-6">
        {#each enabledDays as day (day.id)}
          {@const dayCourses = coursesPerDay[day.id] || []}
          {@const coveredHours = new Set(dayCourses.map(c => c.ora))}
          {@const holes = enabledHours.map((_, idx) => idx).filter(h => !coveredHours.has(h))}
          <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
            <div class="bg-[#FB773C]/10 border-b border-gray-700/50 px-5 py-3 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-[#FB773C]">{day.name}</h3>
              {#if holes.length > 0}
                <span class="text-xs text-red-400">{holes.length} {holes.length === 1 ? 'buco' : 'buchi'}</span>
              {/if}
            </div>
            <div class="p-4 space-y-3">
              {#each enabledHours as _, hourIdx}
                {@const corso = dayCourses.find(c => c.ora === hourIdx)}
                {#if corso}
                  <div class="bg-[#1e1e2e] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div class="flex-shrink-0">
                      <span class="inline-flex items-center justify-center min-w-16 h-10 px-3 bg-green-500/20 text-green-400 font-bold text-sm rounded-xl whitespace-nowrap">
                        {getHourLabel(hourIdx)}
                      </span>
                    </div>
                    <div class="flex-grow min-w-0">
                      <h4 class="text-white font-semibold truncate">{corso.nome}</h4>
                      <p class="text-gray-500 text-sm">Aula: <span class="text-gray-300">{corso.aula}</span></p>
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
                    </div>
                  </div>
                {:else}
                  <!-- Hole -->
                  <div class="bg-red-500/5 border border-red-500/20 border-dashed rounded-xl p-4 flex items-center gap-4">
                    <div class="flex-shrink-0">
                      <span class="inline-flex items-center justify-center min-w-16 h-10 px-3 bg-red-500/10 text-red-400 font-bold text-sm rounded-xl whitespace-nowrap">
                        {getHourLabel(hourIdx)}
                      </span>
                    </div>
                    <div class="flex-grow">
                      <p class="text-red-400/70 text-sm italic">Nessuna iscrizione</p>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
