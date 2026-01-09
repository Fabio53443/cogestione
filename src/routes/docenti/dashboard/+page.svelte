<script>
    export let data;
    const { user, corsi, error } = data;
</script>

<div class="max-w-4xl mx-auto px-4">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <div>
      <h1 class="text-2xl md:text-3xl font-bold text-white">I tuoi corsi</h1>
      <p class="text-gray-400 mt-1">Gestisci i corsi che hai creato</p>
    </div>
    <a 
      href="/docenti/courses/new"
      class="inline-flex items-center justify-center gap-2 bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#FB773C]/20"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
      Nuovo corso
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
      <p class="text-gray-300 text-lg mb-6">Non hai ancora creato nessun corso</p>
      <a 
        href="/docenti/courses/new"
        class="inline-flex items-center gap-2 bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
        Crea il tuo primo corso
      </a>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each corsi as corso}
        <div class="bg-[#252536] rounded-2xl border border-gray-700/50 p-5 hover:border-[#FB773C]/30 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex-grow min-w-0">
              <h3 class="text-lg font-bold text-white mb-1 truncate">{corso.nome}</h3>
              <p class="text-gray-400 text-sm mb-3 line-clamp-2">{corso.descrizione}</p>
              <div class="flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1.5 bg-[#1e1e2e] text-gray-300 text-xs px-3 py-1.5 rounded-lg">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  Aula {corso.aula}
                </span>
                <span class="inline-flex items-center gap-1.5 bg-[#1e1e2e] text-gray-300 text-xs px-3 py-1.5 rounded-lg">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {corso.numPosti} posti
                </span>
              </div>
            </div>
            <a
              href="/docenti/courses/{corso.id}"
              class="inline-flex items-center justify-center gap-2 bg-[#FB773C]/20 hover:bg-[#FB773C]/30 text-[#FB773C] font-medium py-2.5 px-5 rounded-xl transition-colors flex-shrink-0"
            >
              Gestisci
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>