<script>
  export let data;
  
  const { classi, worstClasses, totalSlots, siteConfig, error } = data;
  
  let selectedClasse = null;
  let loadingPdf = false;
  let pdfError = null;
  
  // Get enabled days from config
  $: enabledDays = siteConfig?.days?.filter(d => d.enabled) || [];
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];
  
  // Calculate total holes across all classes
  $: totalHolesAllClasses = classi.reduce((acc, c) => acc + c.totalHoles, 0);
  $: studentsWithHolesCount = classi.reduce((acc, c) => acc + c.studentsWithHoles, 0);
  
  function selectClasse(classe) {
    selectedClasse = selectedClasse?.nome === classe.nome ? null : classe;
  }
  
  async function downloadAttendancePdf(classe, dayId = null) {
    loadingPdf = true;
    pdfError = null;
    
    try {
      const params = new URLSearchParams({ classe: classe.nome });
      if (dayId !== null) {
        params.append('day', dayId);
      }
      
      const response = await fetch(`/api/admin/classi/attendance-pdf?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Errore durante la generazione del PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presenze_${classe.nome}${dayId !== null ? `_giorno${dayId + 1}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      pdfError = err.message;
    } finally {
      loadingPdf = false;
    }
  }
</script>

<div class="max-w-6xl mx-auto px-4">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <h1 class="text-2xl md:text-3xl font-bold text-white">Gestione Classi</h1>
    <div class="flex flex-wrap gap-2">
      <a 
        href="/admin/notifications" 
        class="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-2.5 px-5 rounded-xl border border-gray-700 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        Notifiche
      </a>
      <a 
        href="/admin/settings" 
        class="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-2.5 px-5 rounded-xl border border-gray-700 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        Impostazioni
      </a>
    </div>
  </div>

  <!-- Quick nav buttons -->
  <div class="grid grid-cols-4 gap-3 mb-6">
    <a
      href="/admin?view=students"
      class="flex flex-col items-center gap-2 bg-[#252536] hover:bg-[#2d2d42] text-white font-medium py-4 px-4 rounded-xl border border-gray-700/50 transition-all duration-200">
      <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      <span class="text-sm">Studenti</span>
    </a>
    <div
      class="flex flex-col items-center gap-2 bg-[#252536] text-white font-medium py-4 px-4 rounded-xl border border-gray-700/50 ring-2 ring-[#FB773C]">
      <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      <span class="text-sm">Classi</span>
    </div>
    <a
      href="/admin?view=courses"
      class="flex flex-col items-center gap-2 bg-[#252536] hover:bg-[#2d2d42] text-white font-medium py-4 px-4 rounded-xl border border-gray-700/50 transition-all duration-200">
      <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
      <span class="text-sm">Corsi</span>
    </a>
    <a
      href="/admin?view=teachers"
      class="flex flex-col items-center gap-2 bg-[#252536] hover:bg-[#2d2d42] text-white font-medium py-4 px-4 rounded-xl border border-gray-700/50 transition-all duration-200">
      <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
      <span class="text-sm">Organizzatori</span>
    </a>
  </div>

  <!-- Stats bar -->
  <div class="flex flex-wrap gap-3 mb-6">
    <div class="bg-[#252536] text-gray-300 px-4 py-2 rounded-xl border border-gray-700/50">
      <span class="text-[#FB773C] font-semibold">{classi.length}</span> classi
    </div>
    <div class="bg-[#252536] text-gray-300 px-4 py-2 rounded-xl border border-gray-700/50">
      <span class="text-[#FB773C] font-semibold">{classi.reduce((acc, c) => acc + c.count, 0)}</span> studenti totali
    </div>
    <div class="bg-[#252536] text-gray-300 px-4 py-2 rounded-xl border border-gray-700/50">
      <span class="text-yellow-400 font-semibold">{studentsWithHolesCount}</span> studenti con buchi
    </div>
  </div>

  <!-- Worst Classes Section -->
  {#if worstClasses && worstClasses.length > 0 && worstClasses.some(c => c.totalHoles > 0)}
    <div class="bg-[#252536] rounded-2xl border border-gray-700/50 p-6 mb-6">
      <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        Classi con più buchi
      </h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {#each worstClasses.filter(c => c.totalHoles > 0) as classe}
          <button
            class="bg-[#1e1e2e] p-4 rounded-xl border border-gray-700/50 hover:border-red-500/50 transition-colors text-left min-w-0"
            on:click={() => selectClasse(classe)}
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold text-red-400">{classe.nome}</span>
              </div>
              <div class="min-w-0">
                <p class="text-yellow-400 font-semibold font-medium truncate">              
                  {classe.studentsWithHoles}/{classe.count} con buchi
                </p>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
      {error}
    </div>
  {/if}

  {#if pdfError}
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
      {pdfError}
    </div>
  {/if}

  <div class="grid gap-4">
    {#each classi as classe}
      <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden {classe.totalHoles > 0 ? 'border-l-4 border-l-red-500/50' : ''}">
        <!-- Class Header -->
        <button
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          on:click={() => selectClasse(classe)}
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#FB773C]/20 rounded-xl flex items-center justify-center">
              <span class="text-lg font-bold text-[#FB773C]">{classe.nome}</span>
            </div>
            <div class="text-left">
              <h2 class="text-lg font-semibold text-white">Classe {classe.nome}</h2>
              <p class="text-gray-400 text-sm">{classe.count} studenti</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <svg 
              class="w-5 h-5 text-gray-400 transition-transform {selectedClasse?.nome === classe.nome ? 'rotate-180' : ''}" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <!-- Expanded Content -->
        {#if selectedClasse?.nome === classe.nome}
          <div class="border-t border-gray-700/50 px-6 py-4">
            <!-- Actions Section -->
            <div class="mb-6 flex flex-wrap gap-3">
              <a
                href="/admin/classi/{encodeURIComponent(classe.nome)}"
                class="inline-flex items-center gap-2 px-4 py-2 bg-[#FB773C] hover:bg-[#EB3678] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
                Visualizza Presenze
              </a>
            </div>

            <!-- PDF Download Section -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Scarica Presenze PDF</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  class="px-4 py-2 bg-[#FB773C] hover:bg-[#EB3678] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  on:click={() => downloadAttendancePdf(classe)}
                  disabled={loadingPdf}
                >
                  {loadingPdf ? 'Generazione...' : 'Tutti i giorni'}
                </button>
                {#each enabledDays as day}
                  <button
                    class="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    on:click={() => downloadAttendancePdf(classe, day.id)}
                    disabled={loadingPdf}
                  >
                    {day.name}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Students List -->
            <div>
              <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                Studenti
                {#if classe.studentsWithHoles > 0}
                  <span class="text-red-400 ml-2">({classe.studentsWithHoles} con buchi)</span>
                {/if}
              </h3>
              <div class="grid gap-2">
                {#each classe.students as student}
                  <a 
                    href="/admin/studenti/{student.id}"
                    class="flex items-center gap-3 p-3 bg-[#1e1e2e] rounded-xl hover:bg-white/5 transition-colors {student.holes > 0 ? 'border-l-2 border-l-red-500/50' : ''}"
                  >
                    <div class="w-10 h-10 {student.holes > 0 ? 'bg-red-500/10' : 'bg-[#FB773C]/10'} rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-sm font-medium {student.holes > 0 ? 'text-red-400' : 'text-[#FB773C]'}">{student.nomeCompleto.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="flex-grow min-w-0">
                      <p class="text-white font-medium truncate">{student.nomeCompleto}</p>
                      <p class="text-gray-400 text-sm truncate">{student.email}</p>
                    </div>
                    {#if student.holes > 0}
                      <div class="flex items-center gap-1 bg-red-500/10 text-red-400 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/>
                        </svg>
                        {student.holes} {student.holes === 1 ? 'buco' : 'buchi'}
                      </div>
                    {:else}
                      <div class="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        OK
                      </div>
                    {/if}
                    <svg class="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/each}

    {#if classi.length === 0 && !error}
      <div class="text-center py-12 text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p>Nessuna classe trovata</p>
      </div>
    {/if}
  </div>
</div>
