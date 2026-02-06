<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Alert from '$lib/components/Alert.svelte';

  let courseData = {
    nome: '',
    descrizione: '',
    aula: '',
    numPosti: 0,
    length: 1
  };

  onMount(() => {
    const { corso } = $page.data;
    if (corso) {
      courseData = { ...corso };
    }
  });

  let showAlert = false;
  let alertMessage = "";
  let alertType = "success";
  let saving = false;

  async function handleSubmit(event) {
    event.preventDefault();
    saving = true;
    const requestData = {
      id: courseData.id,
      nome: courseData.nome,
      descrizione: courseData.descrizione,
      aula: courseData.aula,
      numPosti: courseData.numPosti,
      length: courseData.length
    };
    try {
      const response = await fetch('/api/admin/corso', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
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

<Alert type={alertType} message={alertMessage} show={showAlert} on:close={() => showAlert = false} />

<div class="container mx-auto flex flex-col items-center justify-start pt-16 px-4">
  <div class="w-full max-w-md mb-4">
    <a href="/admin/corsi/{courseData.id}" class="text-gray-300 hover:text-white flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      Torna al corso
    </a>
  </div>
  <h1 class="text-3xl font-bold text-center text-[#FB773C] mb-8">Modifica Corso</h1>
  <div class="w-full max-w-md">
    <form on:submit|preventDefault={handleSubmit} class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="nome">Nome del Corso</label>
        <input class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]" id="nome" type="text" bind:value={courseData.nome} placeholder="Nome del corso" required />
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="descrizione">Descrizione</label>
        <textarea class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]" id="descrizione" bind:value={courseData.descrizione} placeholder="Descrizione del corso" rows="4" required></textarea>
      </div>

      <div class="mb-4">
        <label for="aula" class="block text-gray-700 text-sm font-bold mb-2">Aula</label>
        <input
          id="aula"
          type="text"
          bind:value={courseData.aula}
          class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
          placeholder="Aula del corso"
          required
        />
      </div>

      <div class="mb-4">
        <label for="numPosti" class="block text-gray-700 text-sm font-bold mb-2">Numero Posti</label>
        <input
          id="numPosti"
          type="number"
          min="1"
          bind:value={courseData.numPosti}
          class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
          required
        />
      </div>

      <div class="mb-6">
        <label for="length" class="block text-gray-700 text-sm font-bold mb-2">Durata (ore)</label>
        <input
          id="length"
          type="number"
          min="1"
          max="6"
          bind:value={courseData.length}
          class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
          required
        />
      </div>

      <div class="flex items-center justify-between">
        <button 
          class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-200 disabled:opacity-50" 
          type="submit"
          disabled={saving}
        >
          {saving ? 'Salvataggio...' : 'Aggiorna Corso'}
        </button>
      </div>
    </form>
  </div>
</div>