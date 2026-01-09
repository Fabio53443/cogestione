<script>
  import Alert from "$lib/components/Alert.svelte";
  import { goto } from "$app/navigation";
  export let data;
  
  const { siteConfig } = data;
  
  let showAlert = false;
  let alertMessage = "";
  let alertType;
  let loading = false;

  let formData = {
    nome: "",
    descrizione: "",
    aula: "",
    numPosti: "",
    length: 1,
    availability: [],
  };

  // Get enabled days from config
  $: giorni = siteConfig?.days?.filter(d => d.enabled).map(d => ({ id: d.id, name: d.name })) || [
    { id: 0, name: "Lunedì" },
    { id: 1, name: "Martedì" },
    { id: 2, name: "Mercoledì" },
    { id: 3, name: "Giovedì" },
    { id: 4, name: "Venerdì" },
  ];
  
  $: maxCourseLength = siteConfig?.maxCourseLength || 3;
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];

  async function handleSubmit(event) {
    event.preventDefault();
    loading = true;
    try {
      const response = await fetch("/api/docenti/newCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alertType = "success";
        alertMessage = "Corso creato con successo!";
        // Reset form
        formData = {
          nome: "",
          descrizione: "",
          aula: "",
          numPosti: "",
          length: 1,
          availability: [],
        };
        setTimeout(() => {
          goto("/docenti/courses");
        }, 10);
      } else {
        alertType = "error";
        alertMessage = result.message || "Creazione corso fallita.";
      }
    } catch (error) {
      alertType = "error";
      alertMessage = "Si è verificato un errore imprevisto.";
    } finally {
      showAlert = true;
      loading = false;
    }
  }

  function handleGiornoToggle(giornoId) {
    const index = formData.availability.indexOf(giornoId);
    if (index === -1) {
      formData.availability = [...formData.availability, giornoId];
    } else {
      formData.availability = formData.availability.filter(
        (id) => id !== giornoId
      );
    }
  }
</script>

<Alert type={alertType} message={alertMessage} show={showAlert} />

<div class="max-w-2xl mx-auto px-4">
  <!-- Back button -->
  <a href="/docenti/courses" class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
    Torna ai corsi
  </a>

  <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
    <!-- Header -->
    <div class="bg-[#FB773C]/10 border-b border-gray-700/50 px-6 py-4">
      <h1 class="text-xl font-bold text-[#FB773C]">Crea Nuovo Corso</h1>
      <p class="text-gray-400 text-sm mt-1">Compila i dettagli per creare un nuovo corso</p>
    </div>

    <!-- Form -->
    <form on:submit={handleSubmit} class="p-6 space-y-5">
      <!-- Nome -->
      <div>
        <label class="block text-gray-300 text-sm font-medium mb-2" for="nome">
          Nome del Corso
        </label>
        <input
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors"
          id="nome"
          type="text"
          bind:value={formData.nome}
          placeholder="Es. Introduzione alla fotografia"
          required
        />
      </div>

      <!-- Descrizione -->
      <div>
        <label class="block text-gray-300 text-sm font-medium mb-2" for="descrizione">
          Descrizione
        </label>
        <textarea
          class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors resize-none"
          id="descrizione"
          bind:value={formData.descrizione}
          placeholder="Descrivi brevemente il contenuto del corso..."
          rows="3"
          required
        ></textarea>
      </div>

      <!-- Aula e Posti -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2" for="aula">
            Aula
          </label>
          <input
            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors"
            id="aula"
            type="text"
            bind:value={formData.aula}
            placeholder="Es. A101"
            required
          />
        </div>
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2" for="numPosti">
            Posti disponibili
          </label>
          <input
            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors"
            id="numPosti"
            type="number"
            bind:value={formData.numPosti}
            min="1"
            placeholder="25"
            required
          />
        </div>
      </div>

      <!-- Durata -->
      <div>
        <label class="block text-gray-300 text-sm font-medium mb-2" for="length">
          Durata del corso
        </label>
        <div class="flex items-center gap-4">
          <input
            class="flex-1 h-2 bg-[#1e1e2e] rounded-lg appearance-none cursor-pointer accent-[#FB773C]"
            id="length"
            type="range"
            min="1"
            max={maxCourseLength}
            bind:value={formData.length}
            required
          />
          <span class="text-white font-medium min-w-[80px] text-center bg-[#1e1e2e] border border-gray-700 rounded-xl px-3 py-2">
            {formData.length} {formData.length === 1 ? 'ora' : 'ore'}
          </span>
        </div>
      </div>

      <!-- Disponibilità -->
      <div>
        <label class="block text-gray-300 text-sm font-medium mb-3">
          Tua disponibilità
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {#each giorni as giorno}
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 {formData.availability.includes(giorno.id) ? 'bg-[#FB773C] text-white' : 'bg-[#1e1e2e] text-gray-400 border border-gray-700 hover:border-[#FB773C] hover:text-white'}"
              on:click={() => handleGiornoToggle(giorno.id)}
            >
              {giorno.name}
            </button>
          {/each}
        </div>
        {#if formData.availability.length === 0}
          <p class="text-gray-500 text-xs mt-2">Seleziona almeno un giorno di disponibilità</p>
        {/if}
      </div>

      <!-- Submit -->
      <div class="pt-4 border-t border-gray-700/50">
        <button
          class="w-full bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#FB773C]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          type="submit"
          disabled={loading || formData.availability.length === 0}
        >
          {#if loading}
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creazione in corso...
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Crea Corso
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
