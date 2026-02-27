<script>
  import { goto } from '$app/navigation';
  
  export let data;
  
  const { classeName, students, attendanceMatrix, enabledDays, enabledHours, siteConfig, error } = data;
  
  let selectedDay = 0;
  let searchQuery = '';
  let loadingPdf = false;
  let pdfError = null;
  let notePopup = { show: false, name: '', note: '' };

  function showNote(name, note) {
    notePopup = { show: true, name, note };
  }

  function closeNote() {
    notePopup = { show: false, name: '', note: '' };
  }
  
  // Filter students by search
  $: filteredStudents = students.filter(s => 
    s.nomeCompleto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate stats for selected day
  $: dayStats = (() => {
    let present = 0;
    let absent = 0;
    let unknown = 0;
    let noEnrollment = 0;
    
    students.forEach(student => {
      enabledHours.forEach((hour, hourIdx) => {
        const enrollment = attendanceMatrix[student.id]?.[selectedDay]?.[hourIdx];
        if (!enrollment) {
          noEnrollment++;
        } else if (enrollment.presente === true) {
          present++;
        } else if (enrollment.presente === false) {
          absent++;
        } else {
          unknown++;
        }
      });
    });
    
    return { present, absent, unknown, noEnrollment };
  })();
  
  // Get status info for cell
  function getStatusInfo(enrollment) {
    if (!enrollment) {
      return { label: '-', bgClass: 'bg-gray-800/30', textClass: 'text-gray-600' };
    }
    if (enrollment.presente === true) {
      return { label: 'P', bgClass: 'bg-green-500/20', textClass: 'text-green-400' };
    }
    if (enrollment.presente === false) {
      return { label: 'A', bgClass: 'bg-red-500/20', textClass: 'text-red-400' };
    }
    return { label: '?', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' };
  }
  
  // Calculate student summary for the selected day
  function getStudentDaySummary(studentId) {
    let present = 0;
    let absent = 0;
    let unknown = 0;
    let noEnrollment = 0;
    
    enabledHours.forEach((hour, hourIdx) => {
      const enrollment = attendanceMatrix[studentId]?.[selectedDay]?.[hourIdx];
      if (!enrollment) {
        noEnrollment++;
      } else if (enrollment.presente === true) {
        present++;
      } else if (enrollment.presente === false) {
        absent++;
      } else {
        unknown++;
      }
    });
    
    return { present, absent, unknown, noEnrollment };
  }

  async function downloadAttendancePdf(dayId = null) {
    loadingPdf = true;
    pdfError = null;
    
    try {
      const params = new URLSearchParams({ classe: classeName });
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
      a.download = `presenze_${classeName}${dayId !== null ? `_giorno${dayId + 1}` : ''}.pdf`;
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

<div class="max-w-7xl mx-auto px-4">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div class="flex items-center gap-3">
      <button
        on:click={() => goto('/admin/classi')}
        class="p-2 hover:bg-white/5 rounded-lg transition-colors"
        title="Torna alle classi"
      >
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-white">Presenze Classe {classeName}</h1>
        <p class="text-gray-400 text-sm mt-1">{students.length} studenti</p>
      </div>
    </div>
    
    <!-- PDF Download Button -->
    <button
      class="inline-flex items-center gap-2 px-4 py-2 bg-[#FB773C] hover:bg-[#EB3678] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={() => downloadAttendancePdf()}
      disabled={loadingPdf}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      {loadingPdf ? 'Generazione...' : 'Scarica Complessivo'}
    </button>
  </div>

  {#if error}
    <div class="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">
      {error}
    </div>
  {/if}

  {#if pdfError}
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
      {pdfError}
    </div>
  {/if}

  <!-- Day Selector -->
  <div class="flex flex-wrap gap-2 mb-6">
    {#each enabledDays as day, idx}
      <button
        class="px-4 py-2 rounded-xl font-medium transition-all duration-200 {selectedDay === idx 
          ? 'bg-[#FB773C] text-white' 
          : 'bg-[#252536] text-gray-300 hover:bg-[#2d2d42] border border-gray-700/50'}"
        on:click={() => selectedDay = idx}
      >
        {day.name}
      </button>
    {/each}
  </div>

  <!-- Stats for selected day -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <div class="bg-[#252536] rounded-xl border border-gray-700/50 p-4">
      <div class="flex items-center gap-2 mb-1">
        <span class="w-2 h-2 rounded-full bg-green-500"></span>
        <span class="text-gray-400 text-sm">Presenti</span>
      </div>
      <p class="text-2xl font-bold text-green-400">{dayStats.present}</p>
    </div>
    <div class="bg-[#252536] rounded-xl border border-gray-700/50 p-4">
      <div class="flex items-center gap-2 mb-1">
        <span class="w-2 h-2 rounded-full bg-red-500"></span>
        <span class="text-gray-400 text-sm">Assenti</span>
      </div>
      <p class="text-2xl font-bold text-red-400">{dayStats.absent}</p>
    </div>
    <div class="bg-[#252536] rounded-xl border border-gray-700/50 p-4">
      <div class="flex items-center gap-2 mb-1">
        <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
        <span class="text-gray-400 text-sm">Non registrati</span>
      </div>
      <p class="text-2xl font-bold text-yellow-400">{dayStats.unknown}</p>
    </div>
    <div class="bg-[#252536] rounded-xl border border-gray-700/50 p-4">
      <div class="flex items-center gap-2 mb-1">
        <span class="w-2 h-2 rounded-full bg-gray-500"></span>
        <span class="text-gray-400 text-sm">Non iscritti</span>
      </div>
      <p class="text-2xl font-bold text-gray-400">{dayStats.noEnrollment}</p>
    </div>
  </div>

  <!-- Search and Day Download -->
  <div class="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
    <div class="relative flex-1 max-w-md">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        type="text"
        placeholder="Cerca studente..."
        bind:value={searchQuery}
        class="w-full bg-[#252536] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors text-sm"
      />
    </div>
    <button
      class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-medium rounded-xl border border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={() => downloadAttendancePdf(enabledDays[selectedDay]?.id)}
      disabled={loadingPdf}
      title="Scarica PDF per {enabledDays[selectedDay]?.name}"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      Scarica
    </button>
  </div>

  <!-- Attendance Table -->
  <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-700/50">
            <th class="text-left px-4 py-3 text-gray-400 font-medium text-sm sticky left-0 bg-[#252536] z-10 min-w-[200px]">
              Studente
            </th>
            {#each enabledHours as hour, idx}
              <th class="text-center px-3 py-3 text-gray-400 font-medium text-sm min-w-[80px]">
                {hour.label}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each filteredStudents as student (student.id)}
            <tr class="border-b border-gray-700/30 hover:bg-[#1e1e2e]/50 transition-colors">
              <td class="px-4 py-3 sticky left-0 bg-[#252536] z-10">
                <div class="flex items-center gap-2">
                  <a 
                    href="/admin/studenti/{student.id}"
                    class="text-white font-medium hover:text-[#FB773C] transition-colors"
                  >
                    {student.nomeCompleto}
                  </a>
                  {#if student.note}
                    <button class="text-yellow-400 flex-shrink-0 hover:text-yellow-300 transition-colors" on:click|stopPropagation={() => showNote(student.nomeCompleto, student.note)}>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                  {/if}
                  {#if student.sdo}
                    <span class="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">SdO</span>
                  {/if}
                </div>
              </td>
              {#each enabledHours as hour, hourIdx}
                {@const enrollment = attendanceMatrix[student.id]?.[selectedDay]?.[hourIdx]}
                {@const status = getStatusInfo(enrollment)}
                <td class="px-3 py-3 text-center">
                  {#if enrollment}
                    <div 
                      class="inline-flex items-center justify-center w-8 h-8 rounded-lg {status.bgClass} {status.textClass} font-semibold text-sm cursor-help"
                      title="{enrollment.corsoNome || 'Corso'}{enrollment.corsoAula ? ` - Aula ${enrollment.corsoAula}` : ''}"
                    >
                      {status.label}
                    </div>
                  {:else}
                    <div class="inline-flex items-center justify-center w-8 h-8 rounded-lg {status.bgClass} {status.textClass} text-sm">
                      {status.label}
                    </div>
                  {/if}
                </td>
              {/each}
            </tr>
          {:else}
            <tr>
              <td colspan={enabledHours.length + 1} class="px-4 py-8 text-center text-gray-500">
                {#if searchQuery}
                  Nessuno studente trovato per "{searchQuery}"
                {:else}
                  Nessuno studente in questa classe
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Legend -->
  <div class="mt-6 bg-[#252536] rounded-xl border border-gray-700/50 p-4">
    <h3 class="text-sm font-medium text-gray-400 mb-3">Legenda</h3>
    <div class="flex flex-wrap gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-semibold">P</div>
        <span class="text-gray-300">Presente</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-semibold">A</div>
        <span class="text-gray-300">Assente</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-semibold">?</div>
        <span class="text-gray-300">Appello non fatto</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gray-800/30 text-gray-600 flex items-center justify-center">-</div>
        <span class="text-gray-300">Non iscritto</span>
      </div>
    </div>
  </div>
</div>

<!-- Note Popup Modal -->
{#if notePopup.show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" on:click={closeNote}>
    <div class="bg-[#252536] rounded-2xl border border-gray-700/50 w-full max-w-md shadow-2xl" on:click|stopPropagation>
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-700/50">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          <h3 class="text-white font-semibold">Nota - {notePopup.name}</h3>
        </div>
        <button on:click={closeNote} class="text-gray-400 hover:text-white transition-colors p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="px-5 py-4">
        <p class="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{notePopup.note}</p>
      </div>
    </div>
  </div>
{/if}
