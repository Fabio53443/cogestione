<script>
  import Alert from '$lib/components/Alert.svelte';
  export let data;
  
  let config = { ...data.config };
  let showAlert = false;
  let alertMessage = '';
  let alertType = 'success';
  let saving = false;

  // Deep clone for editing
  let editDays = JSON.parse(JSON.stringify(config.days));
  let editHours = JSON.parse(JSON.stringify(config.hours));

  async function saveConfig() {
    saving = true;
    try {
      // Update days and hours from edit state
      config.days = editDays;
      config.hours = editHours;

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: config })
      });

      const result = await response.json();

      if (result.success) {
        alertType = 'success';
        alertMessage = 'Impostazioni salvate con successo!';
      } else {
        alertType = 'error';
        alertMessage = result.message || 'Errore nel salvataggio';
      }
    } catch (error) {
      alertType = 'error';
      alertMessage = 'Errore di connessione';
    } finally {
      saving = false;
      showAlert = true;
    }
  }

  async function initializeDefaults() {
    if (!confirm('Vuoi ripristinare le impostazioni predefinite?')) return;
    
    try {
      const response = await fetch('/api/admin/config', { method: 'PUT' });
      const result = await response.json();
      
      if (result.success) {
        location.reload();
      }
    } catch (error) {
      alertType = 'error';
      alertMessage = 'Errore nel ripristino';
      showAlert = true;
    }
  }

  function addHour() {
    const newId = Math.max(...editHours.map(h => h.id), -1) + 1;
    editHours = [...editHours, {
      id: newId,
      label: `${newId + 1}° ora`,
      startTime: '08:00',
      endTime: '09:00',
      enabled: true
    }];
  }

  function removeHour(id) {
    if (editHours.length <= 1) return;
    editHours = editHours.filter(h => h.id !== id);
  }
</script>

<Alert type={alertType} message={alertMessage} show={showAlert} on:close={() => showAlert = false} />

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-[#FB773C]">Impostazioni</h1>
    <a href="/admin" class="text-gray-300 hover:text-white">← Torna alla dashboard</a>
  </div>

  <!-- General Settings -->
  <div class="bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Impostazioni Generali</h2>
    
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Nome della Scuola</label>
        <input
          type="text"
          bind:value={config.schoolName}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
        />
      </div>
      
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Nome dell'Evento</label>
        <input
          type="text"
          bind:value={config.eventName}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
        />
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Link Social</label>
        <input
          type="url"
          bind:value={config.socialLink}
          placeholder="https://instagram.com/..."
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
        />
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Handle Social</label>
        <input
          type="text"
          bind:value={config.socialHandle}
          placeholder="@nomepagina"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-gray-700 text-sm font-bold mb-2">Messaggio di Benvenuto</label>
        <textarea
          bind:value={config.welcomeMessage}
          rows="3"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
        ></textarea>
      </div>
    </div>
  </div>

  <!-- Registration Settings -->
  <div class="bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Impostazioni Iscrizioni</h2>
    
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Scadenza Iscrizioni</label>
        <input
          type="datetime-local"
          bind:value={config.registrationDeadline}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
        />
      </div>

      <div class="flex items-center">
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.registrationOpen}
            class="form-checkbox h-5 w-5 text-[#FB773C] rounded border-gray-300 mr-2"
          />
          <span class="text-gray-700 font-bold">Iscrizioni Aperte</span>
        </label>
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Durata Massima Corso (ore)</label>
        <input
          type="number"
          min="1"
          max="10"
          bind:value={config.maxCourseLength}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
        />
      </div>
    </div>
  </div>

  <!-- Days Configuration -->
  <div class="bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Giorni Attivi</h2>
    <p class="text-gray-600 text-sm mb-4">Seleziona i giorni in cui si svolgeranno i corsi</p>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      {#each editDays as day, i}
        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 {day.enabled ? 'border-[#FB773C] bg-orange-50' : 'border-gray-200'}">
          <input
            type="checkbox"
            bind:checked={editDays[i].enabled}
            class="form-checkbox h-5 w-5 text-[#FB773C] rounded border-gray-300 mr-3"
          />
          <span class="text-gray-700">{day.name}</span>
        </label>
      {/each}
    </div>
  </div>

  <!-- Hours Configuration -->
  <div class="bg-white shadow-md rounded-lg p-6 mb-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">Ore/Turni</h2>
        <p class="text-gray-600 text-sm">Configura le ore disponibili per i corsi</p>
      </div>
      <button
        on:click={addHour}
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        + Aggiungi Ora
      </button>
    </div>
    
    <div class="space-y-3">
      {#each editHours as hour, i}
        <div class="flex items-center gap-3 p-3 border rounded-lg {hour.enabled ? 'border-[#FB773C] bg-orange-50' : 'border-gray-200'}">
          <input
            type="checkbox"
            bind:checked={editHours[i].enabled}
            class="form-checkbox h-5 w-5 text-[#FB773C] rounded border-gray-300"
          />
          
          <input
            type="text"
            bind:value={editHours[i].label}
            placeholder="Etichetta"
            class="shadow appearance-none border rounded py-2 px-3 text-gray-700 w-32 focus:outline-none focus:border-[#FB773C]"
          />
          
          <div class="flex items-center gap-2">
            <input
              type="time"
              bind:value={editHours[i].startTime}
              class="shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
            />
            <span class="text-gray-500">-</span>
            <input
              type="time"
              bind:value={editHours[i].endTime}
              class="shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-[#FB773C]"
            />
          </div>
          
          <button
            on:click={() => removeHour(hour.id)}
            class="text-red-500 hover:text-red-700 ml-auto"
            disabled={editHours.length <= 1}
          >
            ✕
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Color Settings -->
  <div class="bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Colori</h2>
    
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Colore Primario</label>
        <div class="flex gap-2">
          <input
            type="color"
            bind:value={config.primaryColor}
            class="h-10 w-20 cursor-pointer"
          />
          <input
            type="text"
            bind:value={config.primaryColor}
            class="shadow appearance-none border rounded py-2 px-3 text-gray-700 flex-1 focus:outline-none focus:border-[#FB773C]"
          />
        </div>
      </div>
      
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Colore Secondario</label>
        <div class="flex gap-2">
          <input
            type="color"
            bind:value={config.secondaryColor}
            class="h-10 w-20 cursor-pointer"
          />
          <input
            type="text"
            bind:value={config.secondaryColor}
            class="shadow appearance-none border rounded py-2 px-3 text-gray-700 flex-1 focus:outline-none focus:border-[#FB773C]"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex justify-between">
    <button
      on:click={initializeDefaults}
      class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
    >
      Ripristina Predefiniti
    </button>
    
    <button
      on:click={saveConfig}
      disabled={saving}
      class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-3 px-8 rounded-lg transition duration-200 disabled:opacity-50"
    >
      {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
    </button>
  </div>
</div>
