<script>
  export let data;
  const { student, corsi, error } = data;
  let giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

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
      <div>
        <h1 class="text-3xl font-bold text-[#FB773C]">Dashboard Studente</h1>
      </div>
      <a href="/admin/sdo" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200">
        Torna alla lista
      </a>
    </div>

    <div class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div class="text-xl  mb-3">
            <p >Visualizzazione dei corsi di {student.nomeCompleto}</p>
        </div>
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      {:else if corsi.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-600 text-lg mb-4">Lo studente non è iscritto a nessun corso.</p>
        </div>
      {:else}
        {#each Object.entries(coursesPerDay) as [day, dayCourses] (day)}
          <div class="mb-6">
            <h4 class="text-lg font-bold text-gray-800 mb-3">{giorni[parseInt(day)]}</h4>
            <ul class="space-y-4">
              {#each dayCourses.sort((a, b) => a.ora - b.ora) as corso (corso.uniqueKey)}
                <li class="border rounded-lg p-4 hover:shadow-md transition duration-200 relative">
                  <div class="absolute top-2 right-3">
                    <span class="text-2xl font-bold text-green-500">{corso.ora + 2}°</span>
                  </div>
                  <div class="pr-16">
                    <h5 class="text-lg font-semibold text-[#FB773C] mb-2">{corso.nome}</h5>
                    <p class="text-gray-600 mb-2">{corso.descrizione}</p>
                    <p class="text-gray-700"><span class="font-semibold">Aula:</span> {corso.aula}</p>
                    <p class="text-gray-700"><span class="font-semibold">Docente:</span> {corso.docente}</p>
                    <div class="mt-2">
                      <span class={`px-3 py-1 rounded-full text-sm font-semibold ${corso.presente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {corso.presente ? 'Presente' : 'Assente'}
                      </span>
                    </div>
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
