<script>
  import { goto } from '$app/navigation';
  export let data;
  const { studentId, siteConfig } = data;

  let student = null;
  let corsi = [];
  let loading = true;
  let error = null;
  let togglingAdmin = false;
  let togglingSdO = false;
  let deleting = false;
  let editingClasse = false;
  let newClasse = '';
  let savingClasse = false;

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

  async function toggleAdminStatus() {
    if (togglingAdmin) return;
    togglingAdmin = true;
    try {
      const response = await fetch('/api/admin/admin-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: studentId })
      });
      const result = await response.json();
      if (result.success) {
        student.admin = result.newStatus;
      } else {
        alert(result.message);
      }
    } catch (e) {
      alert('Errore nel cambio stato admin');
    }
    togglingAdmin = false;
  }

  async function toggleSdOStatus() {
    if (togglingSdO) return;
    togglingSdO = true;
    try {
      const response = await fetch('/api/admin/sdo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: studentId })
      });
      const result = await response.json();
      if (result.success) {
        student.sdo = result.newStatus;
      } else {
        alert(result.message);
      }
    } catch (e) {
      alert('Errore nel cambio stato SdO');
    }
    togglingSdO = false;
  }

  async function deleteStudent() {
    if (!confirm("Vuoi veramente eliminare questo studente? Tutte le sue iscrizioni verranno eliminate.")) {
      return;
    }
    deleting = true;
    try {
      const response = await fetch('/api/admin/studente/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: studentId })
      });
      const result = await response.json();
      if (result.success) {
        goto('/admin');
      } else {
        alert(result.message);
      }
    } catch (e) {
      alert('Errore durante l\'eliminazione');
    }
    deleting = false;
  }

  function startEditingClasse() {
    newClasse = student.classe || '';
    editingClasse = true;
  }

  function cancelEditingClasse() {
    editingClasse = false;
    newClasse = '';
  }

  async function saveClasse() {
    if (savingClasse) return;
    savingClasse = true;
    try {
      const response = await fetch(`/api/admin/studente/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classe: newClasse.trim() })
      });
      const result = await response.json();
      if (result.success) {
        student.classe = result.student.classe;
        editingClasse = false;
      } else {
        alert(result.message);
      }
    } catch (e) {
      alert('Errore nel salvataggio della classe');
    }
    savingClasse = false;
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
          <div class="flex items-center gap-2 mt-2">
            {#if editingClasse}
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  bind:value={newClasse}
                  placeholder="es. 5F"
                  class="bg-[#1e1e2e] border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm w-24 focus:outline-none focus:border-[#FB773C]"
                  on:keydown={(e) => e.key === 'Enter' && saveClasse()}
                />
                <button
                  on:click={saveClasse}
                  disabled={savingClasse}
                  aria-label="Salva classe"
                  class="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {#if savingClasse}
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  {:else}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  {/if}
                </button>
                <button
                  on:click={cancelEditingClasse}
                  aria-label="Annulla modifica"
                  class="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            {:else}
              <button
                on:click={startEditingClasse}
                class="inline-flex items-center gap-2 bg-[#1e1e2e] text-gray-300 text-sm px-3 py-1 rounded-lg hover:bg-[#2a2a3a] transition-colors group"
              >
                <span>Classe: {student.classe || 'Non assegnata'}</span>
                <svg class="w-3.5 h-3.5 text-gray-500 group-hover:text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
            {/if}
          </div>
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

      <!-- Admin Actions -->
      <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-700/50 mt-4">
        <button
          on:click={toggleSdOStatus}
          disabled={togglingSdO}
          class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors {student.sdo ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'} disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if togglingSdO}
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          {/if}
          {student.sdo ? 'Rimuovi SdO' : 'Promuovi a SdO'}
        </button>
        <button
          on:click={toggleAdminStatus}
          disabled={togglingAdmin}
          class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors {student.admin ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'} disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if togglingAdmin}
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          {/if}
          {student.admin ? 'Rimuovi Admin' : 'Promuovi ad Admin'}
        </button>
        <button
          on:click={deleteStudent}
          disabled={deleting}
          class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if deleting}
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          {/if}
          Elimina studente
        </button>
      </div>

      <!-- Schedule Status Summary -->
      <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-700/50 mt-4">
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
