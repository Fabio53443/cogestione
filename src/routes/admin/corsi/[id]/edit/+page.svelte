<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import Alert from "$lib/components/Alert.svelte";

  export let data;
  const { teachers } = data;

  let courseData = {
    nome: "",
    descrizione: "",
    aula: "",
    numPosti: 0,
    length: 1,
    docenteId: "",
  };

  onMount(() => {
    const { corso } = $page.data;
    if (corso) {
      courseData = { ...corso, docenteId: corso.docente };
    }
  });

  let showAlert = false;
  let alertMessage = "";
  let alertType = "success";
  let saving = false;

  // Searchable Dropdown State
  let teacherSearchQuery = "";
  let showTeacherDropdown = false;

  $: filteredTeachers = teachers.filter(
    (t) =>
      t.nomeCompleto.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearchQuery.toLowerCase()),
  );

  $: selectedTeacherName =
    teachers.find((t) => t.id === courseData.docenteId)?.nomeCompleto ||
    "Seleziona organizzatore...";

  async function handleSubmit(event) {
    event.preventDefault();
    saving = true;
    const requestData = {
      id: courseData.id,
      nome: courseData.nome,
      descrizione: courseData.descrizione,
      aula: courseData.aula,
      numPosti: courseData.numPosti,
      length: courseData.length,
      docenteId: courseData.docenteId,
    };
    try {
      const response = await fetch("/api/admin/corso", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alertType = "success";
        alertMessage = "Corso aggiornato con successo!";
        showAlert = true;
        setTimeout(() => {
          goto(`/admin/corsi/${courseData.id}`);
        }, 1000);
      } else {
        alertType = "error";
        alertMessage = result.message || "Aggiornamento corso fallito.";
        showAlert = true;
      }
    } catch (error) {
      alertType = "error";
      alertMessage = "Si è verificato un errore imprevisto.";
      showAlert = true;
    } finally {
      saving = false;
    }
  }
</script>

<Alert
  type={alertType}
  message={alertMessage}
  show={showAlert}
  on:close={() => (showAlert = false)}
/>

<div
  class="container mx-auto flex flex-col items-center justify-start pt-16 px-4"
>
  <div class="w-full max-w-md mb-4">
    <a
      href="/admin/corsi/{courseData.id}"
      class="text-gray-300 hover:text-white flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        /></svg
      >
      Torna al corso
    </a>
  </div>
  <h1 class="text-3xl font-bold text-center text-[#FB773C] mb-8">
    Modifica Corso
  </h1>
  <div class="w-full max-w-md">
    <form
      on:submit|preventDefault={handleSubmit}
      class="bg-[#252536] border border-gray-700/50 shadow-md rounded-2xl px-8 pt-6 pb-8 mb-4"
    >
      <div class="mb-4">
        <label class="block text-gray-400 text-sm font-bold mb-2" for="nome"
          >Nome del Corso</label
        >
        <input
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
          id="nome"
          type="text"
          bind:value={courseData.nome}
          placeholder="Nome del corso"
          required
        />
      </div>

      <div class="mb-4">
        <label
          class="block text-gray-400 text-sm font-bold mb-2"
          for="descrizione">Descrizione</label
        >
        <textarea
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
          id="descrizione"
          bind:value={courseData.descrizione}
          placeholder="Descrizione del corso"
          rows="4"
          required
        ></textarea>
      </div>

      <div class="mb-4">
        <label for="aula" class="block text-gray-400 text-sm font-bold mb-2"
          >Aula</label
        >
        <input
          id="aula"
          type="text"
          bind:value={courseData.aula}
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
          placeholder="Aula del corso"
          required
        />
      </div>

      <div class="mb-4">
        <label for="numPosti" class="block text-gray-400 text-sm font-bold mb-2"
          >Numero Posti</label
        >
        <input
          id="numPosti"
          type="number"
          min="1"
          bind:value={courseData.numPosti}
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
          required
        />
      </div>

      <div class="mb-4">
        <label for="length" class="block text-gray-400 text-sm font-bold mb-2"
          >Durata (ore)</label
        >
        <input
          id="length"
          type="number"
          min="1"
          max="6"
          bind:value={courseData.length}
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
          required
        />
      </div>

      <div class="mb-6 relative">
        <span class="block text-gray-400 text-sm font-bold mb-2"
          >Organizzatore</span
        >
        <div class="relative">
          <button
            type="button"
            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white text-left focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors flex justify-between items-center"
            on:click={() => {
              showTeacherDropdown = !showTeacherDropdown;
              if (showTeacherDropdown) teacherSearchQuery = "";
            }}
          >
            <span class="truncate">{selectedTeacherName}</span>
            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              /></svg
            >
          </button>

          {#if showTeacherDropdown}
            <div
              class="absolute z-10 w-full mt-1 bg-[#1e1e2e] border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col"
            >
              <div class="p-2 border-b border-gray-700">
                <input
                  type="text"
                  bind:value={teacherSearchQuery}
                  on:click|stopPropagation
                  placeholder="Cerca per nome o email..."
                  class="w-full bg-[#252536] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FB773C]"
                />
              </div>
              <div class="overflow-y-auto">
                {#each filteredTeachers as teacher (teacher.id)}
                  <button
                    type="button"
                    class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#252536] hover:text-white transition-colors {courseData.docenteId ===
                    teacher.id
                      ? 'bg-[#252536] text-[#FB773C] font-medium'
                      : ''}"
                    on:click={() => {
                      courseData.docenteId = teacher.id;
                      showTeacherDropdown = false;
                    }}
                  >
                    <div class="truncate">{teacher.nomeCompleto}</div>
                    <div class="text-xs text-gray-500 truncate">
                      {teacher.email}
                    </div>
                  </button>
                {:else}
                  <div class="px-4 py-3 text-sm text-gray-500 text-center">
                    Nessun organizzatore trovato
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="flex items-center justify-between mt-8">
        <button
          class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full transition duration-200 disabled:opacity-50"
          type="submit"
          disabled={saving}
        >
          {saving ? "Salvataggio..." : "Aggiorna Corso"}
        </button>
      </div>
    </form>
  </div>
</div>
