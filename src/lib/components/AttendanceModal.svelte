<script>
  export let show = false;
  export let students = [];
  export let onClose;
  export let onUpdateAttendance;

  let selectedStudents = new Set();
  let selectAll = false;
  let searchQuery = '';

  $: filteredStudents = students.filter(s => 
    s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleSelectAll() {
    selectAll = !selectAll;
    selectedStudents.clear();
    if (selectAll) {
      filteredStudents.forEach(student => selectedStudents.add(student.id));
    }
    selectedStudents = selectedStudents;
  }

  function toggleSelect(studentId) {
    if (selectedStudents.has(studentId)) {
      selectedStudents.delete(studentId);
    } else {
      selectedStudents.add(studentId);
    }
    selectAll = selectedStudents.size === filteredStudents.length;
    selectedStudents = selectedStudents;
  }

  // Cycle through states: null -> true -> false -> null
  function getNextState(current) {
    if (current === null || current === undefined) return true;
    if (current === true) return false;
    return null;
  }

  async function setAttendance(student, newState) {
    try {
      const res = await fetch(`/api/studenti/attendance/${student.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          studentId: student.id,
          present: newState 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        const updated = await res.json();
        onUpdateAttendance(updated);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  }

  async function cycleAttendance(student) {
    const newState = getNextState(student.presente);
    await setAttendance(student, newState);
  }

  async function massUpdateAttendance(present) {
    try {
      const promises = Array.from(selectedStudents).map(studentId => 
        fetch(`/api/studenti/attendance/${studentId}`, {
          method: 'PUT',
          body: JSON.stringify({ studentId, present }),
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      const results = await Promise.all(promises);
      const updates = await Promise.all(results.map(res => res.json()));
      onUpdateAttendance(updates);
      selectedStudents.clear();
      selectedStudents = selectedStudents;
    } catch (error) {
      console.error('Error in mass update:', error);
    }
  }

  function composeMassEmail() {
    const selectedEmails = students
      .filter(student => selectedStudents.has(student.id))
      .map(student => student.studentEmail)
      .filter(Boolean)
      .join(',');
    
    if (selectedEmails) {
      window.location.href = `mailto:?bcc=${selectedEmails}`;
    }
  }

  // Helper to get status info
  function getStatusInfo(presente) {
    if (presente === true) {
      return { label: 'Presente', color: 'green', bgClass: 'bg-green-500/20 text-green-400 hover:bg-green-500/30', dotClass: 'bg-green-400' };
    } else if (presente === false) {
      return { label: 'Assente', color: 'red', bgClass: 'bg-red-500/20 text-red-400 hover:bg-red-500/30', dotClass: 'bg-red-400' };
    } else {
      return { label: 'Non registrato', color: 'gray', bgClass: 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30', dotClass: 'bg-gray-400' };
    }
  }

  $: presentCount = students.filter(s => s.presente === true).length;
  $: absentCount = students.filter(s => s.presente === false).length;
  $: unknownCount = students.filter(s => s.presente === null || s.presente === undefined).length;
</script>

{#if show}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
  class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  on:click|self={onClose}
>
  <div class="bg-[#252536] rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-700/50 max-h-[90vh] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
      <div>
        <h2 class="text-xl font-bold text-white">Appello</h2>
        <p class="text-sm text-gray-400 mt-0.5">{students.length} studenti iscritti</p>
      </div>
      <button 
        on:click={onClose}
        class="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        aria-label="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Stats & Actions Bar -->
    <div class="px-6 py-3 border-b border-gray-700/50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <!-- Stats -->
      <div class="flex gap-3">
        <div class="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg text-sm">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          {presentCount} presenti
        </div>
        <div class="flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-sm">
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          {absentCount} assenti
        </div>
        <div class="flex items-center gap-2 bg-gray-500/10 text-gray-400 px-3 py-1.5 rounded-lg text-sm">
          <span class="w-2 h-2 rounded-full bg-gray-500"></span>
          {unknownCount} da registrare
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-2">
        <button
          class="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          disabled={selectedStudents.size === 0}
          on:click={composeMassEmail}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email ({selectedStudents.size})
        </button>
        <button
          class="px-3 py-1.5 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          disabled={selectedStudents.size === 0}
          on:click={() => massUpdateAttendance(true)}
        >
          ✓ Presenti
        </button>
        <button
          class="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          disabled={selectedStudents.size === 0}
          on:click={() => massUpdateAttendance(false)}
        >
          ✗ Assenti
        </button>
        <button
          class="px-3 py-1.5 text-sm bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          disabled={selectedStudents.size === 0}
          on:click={() => massUpdateAttendance(null)}
        >
          ↺ Reset
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="px-6 py-3 border-b border-gray-700/50">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Cerca studente..."
          bind:value={searchQuery}
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors"
        />
      </div>
    </div>

    <!-- Table Header -->
    <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-[#1e1e2e] text-xs font-medium text-gray-400 uppercase tracking-wider">
      <div class="col-span-1">
        <input
          type="checkbox"
          checked={selectAll}
          on:change={toggleSelectAll}
          class="w-4 h-4 rounded border-gray-600 bg-[#252536] text-[#FB773C] focus:ring-[#FB773C] focus:ring-offset-0"
        />
      </div>
      <div class="col-span-4">Nome</div>
      <div class="col-span-5">Email</div>
      <div class="col-span-2">Stato</div>
    </div>

    <!-- Student List -->
    <div class="flex-1 overflow-y-auto">
      {#each filteredStudents as student (student.id)}
        {@const status = getStatusInfo(student.presente)}
        <div class="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-700/30 hover:bg-[#1e1e2e]/50 items-center transition-colors">
          <div class="col-span-1">
            <input
              type="checkbox"
              checked={selectedStudents.has(student.id)}
              on:change={() => toggleSelect(student.id)}
              class="w-4 h-4 rounded border-gray-600 bg-[#252536] text-[#FB773C] focus:ring-[#FB773C] focus:ring-offset-0"
            />
          </div>
          <div class="col-span-4">
            <span class="font-medium text-white">{student.studentName || 'N/A'}</span>
          </div>
          <div class="col-span-5 truncate">
            {#if student.studentEmail}
              <a 
                href="mailto:{student.studentEmail}" 
                class="text-gray-400 hover:text-[#FB773C] transition-colors text-sm"
              >
                {student.studentEmail}
              </a>
            {:else}
              <span class="text-gray-600 text-sm">Nessuna email</span>
            {/if}
          </div>
          <div class="col-span-2">
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 {status.bgClass}"
              on:click={() => cycleAttendance(student)}
              title="Clicca per cambiare stato"
            >
              <span class="h-2 w-2 rounded-full {status.dotClass}"></span>
              {status.label}
            </button>
          </div>
        </div>
      {:else}
        <div class="px-6 py-8 text-center text-gray-500">
          {#if searchQuery}
            Nessuno studente trovato per "{searchQuery}"
          {:else}
            Nessuno studente iscritto
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
{/if}