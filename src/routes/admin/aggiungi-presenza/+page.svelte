<script>
    import { onMount } from "svelte";

    export let data;
    const { siteConfig, students, courses, user } = data;

    let selectedStudent = "";
    let selectedCourse = "";
    let selectedDay = "";
    let selectedHour = "";

    let loading = false;
    let successMessage = "";
    let errorMessage = "";

    // Student search combobox state
    let studentSearch = "";
    let studentDropdownOpen = false;
    let selectedStudentName = "";

    $: filteredStudents = studentSearch
        ? students.filter((s) =>
              s.nomeCompleto
                  .toLowerCase()
                  .includes(studentSearch.toLowerCase()),
          )
        : students;

    function selectStudent(student) {
        selectedStudent = student.id;
        selectedStudentName = student.nomeCompleto;
        studentSearch = student.nomeCompleto;
        studentDropdownOpen = false;
    }

    function handleStudentInput() {
        studentDropdownOpen = true;
        // Clear selection if user edits the text
        if (studentSearch !== selectedStudentName) {
            selectedStudent = "";
        }
    }

    function handleStudentFocus() {
        studentDropdownOpen = true;
    }

    function handleStudentBlur() {
        // Delay to allow click on dropdown item
        setTimeout(() => {
            studentDropdownOpen = false;
            // If no valid selection, reset
            if (!selectedStudent) {
                studentSearch = "";
            }
        }, 200);
    }

    // Generate days options from config
    const days = siteConfig?.days?.filter((d) => d.enabled) || [
        { id: 0, name: "Lunedì" },
        { id: 1, name: "Martedì" },
        { id: 2, name: "Mercoledì" },
        { id: 3, name: "Giovedì" },
        { id: 4, name: "Venerdì" },
    ];

    async function submitAttendance() {
        if (
            selectedStudent === "" ||
            selectedCourse === "" ||
            selectedDay === "" ||
            selectedHour === ""
        ) {
            errorMessage = "Please fill in all fields.";
            return;
        }

        loading = true;
        successMessage = "";
        errorMessage = "";

        try {
            const response = await fetch("/api/admin/manual-attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedStudent,
                    courseId: selectedCourse,
                    day: selectedDay,
                    hour: selectedHour,
                }),
            });

            const result = await response.json();

            if (result.success) {
                successMessage = result.message;
            } else {
                errorMessage = result.message;
            }
        } catch (error) {
            console.error("Failed to submit manual attendance", error);
            errorMessage = "Errore di rete durante il salvataggio.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8 flex items-center gap-4">
        <a
            href="/admin"
            class="text-gray-400 hover:text-white transition-colors"
            aria-label="Torna alla dashboard Admin"
        >
            <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
        </a>
        <h1 class="text-2xl md:text-3xl font-bold text-white">Presenze</h1>
    </div>

    <div class="bg-[#252536] p-6 rounded-2xl border border-gray-700/50">
        <p class="text-gray-400 mb-6 text-sm">Aggiungi presenza manualmente</p>

        {#if successMessage}
            <div
                class="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6"
            >
                {successMessage}
            </div>
        {/if}

        {#if errorMessage}
            <div
                class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6"
            >
                {errorMessage}
            </div>
        {/if}

        <form on:submit|preventDefault={submitAttendance} class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Studente (searchable combobox) -->
                <div class="relative">
                    <label
                        for="student-search"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Studente</label
                    >
                    <input
                        id="student-search"
                        type="text"
                        bind:value={studentSearch}
                        on:input={handleStudentInput}
                        on:focus={handleStudentFocus}
                        on:blur={handleStudentBlur}
                        placeholder="Cerca studente..."
                        autocomplete="off"
                        class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                    />
                    {#if studentDropdownOpen && filteredStudents.length > 0}
                        <ul
                            class="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-[#1e1e2e] border border-gray-700 rounded-xl shadow-lg"
                        >
                            {#each filteredStudents as student}
                                <li>
                                    <button
                                        type="button"
                                        class="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#FB773C]/20 transition-colors cursor-pointer {selectedStudent ===
                                        student.id
                                            ? 'bg-[#FB773C]/10 text-[#FB773C]'
                                            : ''}"
                                        on:mousedown|preventDefault={() =>
                                            selectStudent(student)}
                                    >
                                        {student.nomeCompleto}
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                    {#if studentDropdownOpen && studentSearch && filteredStudents.length === 0}
                        <div
                            class="absolute z-50 mt-1 w-full bg-[#1e1e2e] border border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500"
                        >
                            Nessuno studente trovato
                        </div>
                    {/if}
                </div>

                <!-- Corso -->
                <div>
                    <label
                        for="course-select"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Corso</label
                    >
                    <select
                        id="course-select"
                        bind:value={selectedCourse}
                        class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                        required
                    >
                        <option value="" disabled>Seleziona corso</option>
                        {#each courses as course}
                            <option value={course.id}
                                >{course.nome} (Durata: {course.length}h)</option
                            >
                        {/each}
                    </select>
                </div>

                <!-- Giorno -->
                <div>
                    <label
                        for="day-select"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Giorno</label
                    >
                    <select
                        id="day-select"
                        bind:value={selectedDay}
                        class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                        required
                    >
                        <option value="" disabled>Seleziona giorno</option>
                        {#each days as day}
                            <option value={day.id}>{day.name}</option>
                        {/each}
                    </select>
                </div>

                <!-- Ora -->
                <div>
                    <label
                        for="hour-select"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Ora (Inizio)</label
                    >
                    <select
                        id="hour-select"
                        bind:value={selectedHour}
                        class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                        required
                    >
                        <option value="" disabled>Seleziona ora</option>
                        {#each Array(4) as _, i}
                            <option value={i + 1}>{i + 1}° Ora</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                    {#if loading}
                        <div
                            class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        ></div>
                        Salvataggio...
                    {:else}
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Aggiungi Presenza e Iscrizione
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
