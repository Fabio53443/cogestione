<script>
  import Alert from "$lib/components/Alert.svelte";
  import { goto } from "$app/navigation";
  export let data;
  
  const { siteConfig } = data;
  
  let showAlert = false;
  let alertMessage = "";
  let alertType;

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
          length: "",
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

<div
  class="container mx-auto flex flex-col items-center justify-start pt-16 px-4"
>
  <h1 class="text-3xl font-bold text-center text-[#FB773C] mb-8">
    Crea Nuovo Corso
  </h1>
  <div class="w-full max-w-md">
    <form
      on:submit={handleSubmit}
      class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
    >
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="nome">
          Nome del Corso
        </label>
        <input
          class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
          id="nome"
          type="text"
          bind:value={formData.nome}
          placeholder="Nome del corso"
          required
        />
      </div>

      <div class="mb-4">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="descrizione"
        >
          Descrizione
        </label>
        <textarea
          class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
          id="descrizione"
          bind:value={formData.descrizione}
          placeholder="Descrizione del corso"
          rows="4"
          required
        />
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="aula">
          Aula
        </label>
        <input
          class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
          id="aula"
          type="text"
          bind:value={formData.aula}
          placeholder="Numero o nome dell'aula"
          required
        />
      </div>

      <div class="mb-4">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="numPosti"
        >
          Numero di Posti
        </label>
        <input
          class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
          id="numPosti"
          type="number"
          bind:value={formData.numPosti}
          min="1"
          placeholder="Numero di posti disponibili"
          required
        />
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="length">
          Durata (ore ogni giorno)
        </label>
        <div class="flex items-center gap-4">
          <input
        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FB773C]"
        id="length"
        type="range"
        min="1"
        max={maxCourseLength}
        bind:value={formData.length}
        required
          />
          <span class="text-gray-700 font-medium min-w-[80px] text-center bg-gray-100 rounded-lg px-3 py-1">
        {formData.length} {formData.length === 1 ? 'ora' : 'ore'}
          </span>
        </div>
      </div>

      <div class="mb-6">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Tua disponibilità
        </label>
        <div class="grid grid-cols-2 gap-2">
          {#each giorni as giorno}
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.availability.includes(giorno.id)}
                on:change={() => handleGiornoToggle(giorno.id)}
                class="form-checkbox h-5 w-5 text-[#FB773C] rounded border-gray-300 focus:ring-[#EB3678]"
              />
              <span class="ml-2 text-gray-700">{giorno.name}</span>
            </label>
          {/each}
        </div>
      </div>

      <div class="flex items-center justify-between">
        <button
          class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-200"
          type="submit"
        >
          Crea Corso
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  input[type="checkbox"] {
    cursor: pointer;
  }

  button:hover {
    cursor: pointer;
  }
</style>
