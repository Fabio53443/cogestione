<script>
  export let data;
  
  const { classi, siteConfig, error } = data;
  
  let selectedClasse = null;
  let loadingPdf = false;
  let pdfError = null;
  
  // Get enabled days from config
  $: enabledDays = siteConfig?.days?.filter(d => d.enabled) || [];
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];
  
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
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-white">Gestione Classi</h1>
    <div class="text-gray-400 text-sm">
      {classi.length} classi • {classi.reduce((acc, c) => acc + c.count, 0)} studenti totali
    </div>
  </div>

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
      <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
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
          <div class="flex items-center gap-3">
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
            <!-- PDF Download Section -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Scarica Presenze</h3>
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
              <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Studenti</h3>
              <div class="grid gap-2">
                {#each classe.students as student}
                  <a 
                    href="/admin/studenti/{student.id}"
                    class="flex items-center gap-3 p-3 bg-[#1e1e2e] rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div class="w-10 h-10 bg-[#FB773C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-sm font-medium text-[#FB773C]">{student.nomeCompleto.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="flex-grow min-w-0">
                      <p class="text-white font-medium truncate">{student.nomeCompleto}</p>
                      <p class="text-gray-400 text-sm truncate">{student.email}</p>
                    </div>
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
