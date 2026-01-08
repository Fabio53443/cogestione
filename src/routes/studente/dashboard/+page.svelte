<script>
  export let data;
  const { user, corsi, error, siteConfig } = data;
  import Alert from "$lib/components/Alert.svelte";
  
  // Get enabled days from config
  $: giorni = siteConfig?.days?.filter(d => d.enabled).map(d => d.name) || ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
  $: enabledHours = siteConfig?.hours?.filter(h => h.enabled) || [];
  
  const navigateToRegistration = () => {
    window.location.href = '/studente/corsi';
  };

  const unenroll = async (idCorso, giorno, ora) => {
    try {
      const response = await fetch('/api/studenti/enroll', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idCorso, giorno, ora })
      });

      const result = await response.json();
      if (result.success) {
        location.reload();
      } else {
        alert(`Unenrollment failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Unenrollment Error:', error);
      alert('Unenrollment failed.');
    }
  };
  
  // Get hour label from config
  function getHourLabel(hourIndex) {
    const hour = enabledHours[hourIndex];
    return hour ? hour.label : `${hourIndex + 1}°`;
  }
  
  $: coursesPerDay = corsi.reduce((acc, corso) => {
    const day = corso.giorno;
    if (!acc[day]) acc[day] = [];
    acc[day].push(corso);
    return acc;
  }, {});
</script>
<div class="container mx-auto flex flex-col items-center justify-start pt-16 px-4">
  <div class="w-full max-w-4xl">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-[#FB773C]">I tuoi corsi</h1>
      <a href="/studente/corsi" class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"> Iscriviti ai corsi</a>
    </div>

    <div class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
      <h2 class="text-2xl font-semibold text-gray-700 mb -6">Benvenuto!</h2>
      <p class="text-gray-600 mb-4">Qui sotto puoi visualizzare i corsi a cui sei iscritto.</p>
      
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      {:else if corsi.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-600 text-lg mb-4">Non sei ancora iscritto a nessun corso.</p>
          <a 
            href="/studente/corsi"
            class="inline-block bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
          >
            Sfoglia i corsi disponibili
          </a>
        </div>
      {:else}
        <h3 class="text-xl font-semibold text-gray-700 mb-4">I tuoi corsi</h3>
        {#each Object.entries(coursesPerDay) as [day, dayCourses] (day)}
          <div class="mb-6">
            <h4 class="text-lg font-bold text-gray-800 mb-3">{giorni[parseInt(day)] || `Giorno ${parseInt(day) + 1}`}</h4>
            <ul class="space-y-4">
              {#each dayCourses.sort((a, b) => a.ora - b.ora) as corso (corso.uniqueKey)}
                <li class="border rounded-lg p-4 hover:shadow-md transition duration-200 relative">
                  <div class="absolute top-2 right-3">
                    <span class="text-2xl font-bold text-green-500">{getHourLabel(corso.ora)}</span>
                  </div>
                  <div class="pr-16"> <!-- Add padding-right to prevent text overlap with hour -->
                    <h5 class="text-lg font-semibold text-[#FB773C] mb-2">{corso.nome}</h5>
                    <p class="text-gray-600 mb-3">{corso.descrizione}</p>
                    <p class="text-gray-700"><span class="font-semibold">Aula:</span> {corso.aula}</p>
                    <button
                    class="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-200"
                    on:click={() => unenroll(corso.id, corso.giorno, corso.ora)}
                  >
                    Disiscriviti
                  </button>

                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>