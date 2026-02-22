<script>
    import { enhance } from "$app/forms";
    import Alert from "$lib/components/Alert.svelte";

    export let data;
    export let form;

    const { user, corsi, error } = data;
    let showAlert = !!form;
    let alertMessage = form?.message || "";
    let alertType = form?.success ? "success" : "error";

    const days = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];
    let selectedDays = new Set();
    let isDropdownOpen = false;
    let searchQuery = "";

    $: filteredCorsi = corsi.filter((corso) => {
        const matchesDays =
            selectedDays.size === 0 ||
            corso.availability.some((day) => selectedDays.has(day));
        const matchesSearch =
            searchQuery === "" ||
            corso.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            corso.descrizione.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDays && matchesSearch;
    });

    const toggleDay = (index) => {
        if (selectedDays.has(index)) {
            selectedDays.delete(index);
        } else {
            selectedDays.add(index);
        }
        selectedDays = selectedDays; // trigger reactivity
    };

    const handleClickOutside = (event) => {
        const dropdown = document.getElementById("dropdown");
        if (dropdown && !dropdown.contains(event.target)) {
            isDropdownOpen = false;
        }
    };

    const handleKeyDown = (event, index) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleDay(index);
        }
    };
</script>

<svelte:window on:click={handleClickOutside} />

<Alert type={alertType} message={alertMessage} show={showAlert} />

<div class="max-w-4xl mx-auto px-4 overflow-hidden">
    <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-6">
            Corsi Disponibili
        </h1>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 relative">
                <svg
                    class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    /></svg
                >
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Cerca corsi..."
                    class="w-full bg-[#252536] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                />
            </div>
            <div class="relative" id="dropdown">
                <button
                    on:click={() => (isDropdownOpen = !isDropdownOpen)}
                    class="w-full sm:w-auto bg-[#252536] border border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between gap-2 text-gray-300 hover:border-[#FB773C] transition-colors"
                >
                    <span class="truncate">
                        {selectedDays.size === 0
                            ? "Tutti i giorni"
                            : `${selectedDays.size} selezionati`}
                    </span>
                    <svg
                        class="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {#if isDropdownOpen}
                    <div
                        class="absolute z-10 mt-2 w-full sm:w-56 bg-[#252536] border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                    >
                        {#each days as day, index}
                            <div
                                role="menuitem"
                                tabindex="0"
                                class="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b last:border-b-0 border-gray-700/50"
                                on:click={() => toggleDay(index)}
                                on:keydown={(e) => handleKeyDown(e, index)}
                            >
                                <div
                                    class="w-5 h-5 rounded border-2 flex items-center justify-center {selectedDays.has(
                                        index,
                                    )
                                        ? 'bg-[#FB773C] border-[#FB773C]'
                                        : 'border-gray-600'}"
                                >
                                    {#if selectedDays.has(index)}
                                        <svg
                                            class="w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            ><path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="3"
                                                d="M5 13l4 4L19 7"
                                            /></svg
                                        >
                                    {/if}
                                </div>
                                <span class="text-gray-300">{day}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    {#if error}
        <div
            class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl"
        >
            {error}
        </div>
    {:else if filteredCorsi.length === 0}
        <div
            class="bg-[#252536] rounded-2xl p-8 text-center border border-gray-700/50"
        >
            <p class="text-gray-400">
                {selectedDays.size === 0
                    ? "Non ci sono corsi disponibili."
                    : "Nessun corso per i giorni selezionati."}
            </p>
        </div>
    {:else}
        <div class="grid gap-4">
            {#each filteredCorsi as corso (corso.id)}
                <div
                    class="bg-[#252536] rounded-xl p-4 sm:p-5 border border-gray-700/50 hover:border-gray-600 transition-colors overflow-hidden"
                >
                    <div
                        class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4"
                    >
                        <div class="flex-grow min-w-0 overflow-hidden">
                            <h3
                                class="text-lg font-semibold text-white truncate"
                            >
                                {corso.nome}
                            </h3>
                            <p
                                class="text-gray-400 text-sm mt-1 line-clamp-2 break-words"
                            >
                                {corso.descrizione}
                            </p>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span
                            class="inline-flex items-center gap-1.5 bg-[#1e1e2e] text-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg"
                        >
                            <svg
                                class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                /></svg
                            >
                            <span class="truncate">{corso.aula}</span>
                        </span>
                        <span
                            class="inline-flex items-center gap-1.5 bg-[#1e1e2e] text-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg"
                        >
                            <svg
                                class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                /></svg
                            >
                            {corso.length}h
                        </span>
                        <span
                            class="inline-flex items-center gap-1.5 bg-[#1e1e2e] text-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg"
                        >
                            <svg
                                class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                /></svg
                            >
                            <span class="truncate"
                                >{corso.availability
                                    .map((d) => days[d].slice(0, 3))
                                    .join(", ")}</span
                            >
                        </span>
                        <span
                            class="inline-flex items-center gap-1.5 {corso.postiDisponibili <=
                            0
                                ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                : corso.postiDisponibili <= 3
                                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'} border text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium"
                        >
                            <svg
                                class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                /></svg
                            >
                            <span class="truncate"
                                >{corso.postiDisponibili <= 0
                                    ? "Al completo"
                                    : corso.postiDisponibili <= 3
                                      ? "Ultimi posti"
                                      : "Posti disponibili"}</span
                            >
                        </span>
                    </div>
                    <a
                        href="/studente/corsi/{corso.id}"
                        class="block w-full bg-[#FB773C] hover:bg-[#EB3678] text-white text-center font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
                    >
                        Iscriviti
                    </a>
                </div>
            {/each}
        </div>
    {/if}
</div>
