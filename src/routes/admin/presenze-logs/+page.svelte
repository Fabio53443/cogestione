<script>
  import { onMount } from 'svelte';
  let logs = [];
  let page = 1;
  let perPage = 50;
  let loading = false;
  let query = '';
  let details = { show: false, item: null };

  async function fetchLogs() {
    loading = true;
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  if (query) params.append('q', query);
    const res = await fetch(`/api/admin/presenze-logs?${params}`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      logs = data.logs;
    } else {
      logs = [];
    }
    loading = false;
  }

  onMount(fetchLogs);

  function showDetails(item) {
    details = { show: true, item };
  }

  function closeDetails() {
    details = { show: false, item: null };
  }
</script>

<div class="max-w-6xl mx-auto px-4">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-white">Log Presenze</h1>
    <div class="flex items-center gap-2">
  <input placeholder="Cerca" bind:value={query} class="bg-[#252536] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
      <button class="px-4 py-2 bg-[#FB773C] rounded-xl text-white" on:click={() => { page = 1; fetchLogs(); }} disabled={loading}>Cerca</button>
    </div>
  </div>

  <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-700/50 text-gray-400 text-sm">
            <th class="px-4 py-3 text-left">#</th>
            <th class="px-4 py-3 text-left">Studente</th>
            <th class="px-4 py-3 text-left">Corso</th>
            <th class="px-4 py-3 text-left">Giorno</th>
            <th class="px-4 py-3 text-left">Ora</th>
            <th class="px-4 py-3 text-left">Prev</th>
            <th class="px-4 py-3 text-left">New</th>
            <th class="px-4 py-3 text-left">By</th>
            <th class="px-4 py-3 text-left">When</th>
          </tr>
        </thead>
        <tbody>
          {#each logs as l}
            <tr class="border-b border-gray-700/30 hover:bg-[#1e1e2e]/50 transition-colors">
              <td class="px-4 py-3 text-sm text-gray-300">{l.id}</td>
              <td class="px-4 py-3 text-sm text-white">{l.student_name || l.id_studente}</td>
              <td class="px-4 py-3 text-sm text-gray-300">{#if l.id_corso}
                <a href="/admin/corsi/{l.id_corso}" class="hover:text-[#FB773C] text-gray-300">{l.course_name || `Corso ${l.id_corso}`}</a>
              {:else}
                {l.course_name || l.id_corso}
              {/if}</td>
              <td class="px-4 py-3 text-sm text-gray-300">{l.giorno != null ? l.giorno + 1 : '-'}</td>
              <td class="px-4 py-3 text-sm text-gray-300">{l.ora != null ? l.ora + 1 : '-'}</td>
              <td class="px-4 py-3 text-sm text-yellow-300">{l.previous_presente === null ? '-' : l.previous_presente ? 'P' : 'A'}</td>
              <td class="px-4 py-3 text-sm text-green-300">{l.new_presente === null ? '-' : l.new_presente ? 'P' : 'A'}</td>
              <td class="px-4 py-3 text-sm text-gray-300">{l.changed_by_name ? l.changed_by_name : `ID ${l.changed_by}`}</td>
              <td class="px-4 py-3 text-sm text-gray-400">{l.created_at}</td>
              <td class="px-4 py-3">
                <button class="text-sm text-white/80 hover:text-white" on:click={() => showDetails(l)}>Dettagli</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div class="text-sm text-gray-400">Pagina {page}</div>
    <div class="flex gap-2">
      <button class="px-3 py-1 bg-white/5 rounded" on:click={() => { page = Math.max(1, page - 1); fetchLogs(); }}>Prev</button>
      <button class="px-3 py-1 bg-white/5 rounded" on:click={() => { page = page + 1; fetchLogs(); }}>Next</button>
    </div>
  </div>

  {#if details.show}
    <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" on:click={closeDetails}>
      <div class="bg-[#252536] rounded-2xl border border-gray-700/50 w-full max-w-2xl" on:click|stopPropagation>
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-700/50">
          <h3 class="text-white font-semibold">Log #{details.item.id}</h3>
          <button on:click={closeDetails} class="text-gray-400 hover:text-white">Chiudi</button>
        </div>
        <div class="px-5 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-lg">{details.item.student_name ? details.item.student_name.split(' ').map(n=>n[0]).join('').slice(0,2) : (String(details.item.id_studente||'').slice(0,2))}</div>
            <div>
              <div class="text-sm text-gray-400">Studente</div>
              <div class="text-white font-semibold">{details.item.student_name || `ID ${details.item.id_studente}`}</div>
              <div class="text-sm text-gray-400 mt-1">Classe: {details.item.classe || '-'}</div>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-lg">{String(details.item.changed_by||'').slice(0,2)}</div>
            <div>
              <div class="text-sm text-gray-400">Modificato da</div>
              <div class="text-white font-semibold">{details.item.changed_by_name ? details.item.changed_by_name : `ID ${details.item.changed_by}`}</div>
              <div class="text-sm text-gray-400 mt-1">{details.item.changed_by_name ? (details.item.changed_by === details.item.id_studente ? 'Stesso studente' : 'SDO') : 'Non-SDO / ID'}</div>
            </div>
          </div>

          <div class="md:col-span-2">
            <div class="flex items-center gap-3">
              <div class="px-3 py-1 rounded bg-gray-800 text-sm text-gray-300">Corso: {#if details.item.id_corso}
                <a href="/admin/corsi/{details.item.id_corso}" class="hover:text-[#FB773C]">{details.item.course_name || `Corso ${details.item.id_corso}`}</a>
              {:else}
                {details.item.course_name || details.item.id_corso}
              {/if}</div>
              <div class="px-3 py-1 rounded bg-gray-800 text-sm text-gray-300">Giorno: {details.item.giorno != null ? details.item.giorno + 1 : '-'}</div>
              <div class="px-3 py-1 rounded bg-gray-800 text-sm text-gray-300">Ora: {details.item.ora != null ? details.item.ora + 1 : '-'}</div>
              <div class="ml-auto text-sm text-gray-400">{details.item.created_at}</div>
            </div>
          </div>

          <div class="md:col-span-2 mt-2 flex items-center gap-3">
            <div class="px-3 py-2 rounded-lg bg-yellow-500/10 text-yellow-300 font-semibold">Prev: {details.item.previous_presente === null ? '-' : details.item.previous_presente ? 'Presente' : 'Assente'}</div>
            <div class="px-3 py-2 rounded-lg bg-green-500/10 text-green-300 font-semibold">New: {details.item.new_presente === null ? '-' : details.item.new_presente ? 'Presente' : 'Assente'}</div>
            <div class="ml-auto text-sm text-gray-400">Iscrizione ID: {details.item.id_iscrizione || '-'}</div>
          </div>

          <div class="md:col-span-2">
            <h4 class="text-sm text-gray-400 mb-2">Motivo</h4>
            <div class="bg-[#1e1e2e] p-3 rounded text-sm text-gray-300">{details.item.reason || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
