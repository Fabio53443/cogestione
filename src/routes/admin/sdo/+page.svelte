<script>
    export let data;
    const { user, students, pageName } = data;

    let searchQuery = '';
    let currentPage = 1;
    const itemsPerPage = 10;

    $: filteredStudents = students.filter(student => {
        return searchQuery === '' || 
            student.nomeCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    $: totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    $: paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    function changePage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    $: {
        // Reset to first page when search changes
        if (searchQuery) currentPage = 1;
    }

    function getPageRange(current, total) {
        let pages = [];
        
        // Always show first page
        pages.push(1);
        
        // Calculate range around current page
        let start = Math.max(2, current - 1);
        let end = Math.min(total - 1, current + 1);
        
        // Add ellipsis after first page
        if (start > 2) {
            pages.push('...');
        }
        
        // Add pages around current page
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        // Add ellipsis before last page
        if (end < total - 1) {
            pages.push('...');
        }
        
        // Always show last page if there is more than one page
        if (total > 1) {
            pages.push(total);
        }
        
        return pages;
    }
</script>

<div class="container mx-auto px-4 py-8">
    <div class="bg-white shadow-lg rounded-lg p-6">
        <h1 class="text-3xl font-bold text-[#FB773C] mb-8">Gestione Studenti</h1>

        <!-- Search Bar -->
        <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="search">
                Cerca studente
            </label>
            <input
                type="text"
                id="search"
                bind:value={searchQuery}
                placeholder="Cerca per nome o email..."
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#FB773C] focus:outline-none transition-colors duration-200"
            />
        </div>

        {#if filteredStudents.length === 0}
            <div class="text-center py-8 text-gray-600">
                Nessuno studente trovato
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-gray-700">ID</th>
                            <th class="px-6 py-3 text-left text-gray-700">Nome</th>
                            <th class="px-6 py-3 text-left text-gray-700">Email</th>
                            <th class="px-6 py-3 text-left text-gray-700">Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each paginatedStudents as student}
                            <tr class="border-t hover:bg-gray-50">
                                <td class="px-6 py-4 text-gray-700">{student.id}</td>
                                <td class="px-6 py-4 text-gray-700">{student.nomeCompleto}</td>
                                <td class="px-6 py-4 text-gray-700">{student.email}</td>
                                <td class="px-6 py-4">
                                    <a
                                        href="/admin/sdo/{student.id}"
                                        class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded transition duration-200"
                                    >
                                        Info
                                    </a>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>

                <!-- Pagination Controls -->
                <div class="mt-6 flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                    </div>
                    <div class="flex gap-2">
                        <button
                            on:click={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            class="px-3 py-1 rounded border {currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'}"
                        >
                            Previous
                        </button>
                        
                        {#each getPageRange(currentPage, totalPages) as page}
                            {#if page === '...'}
                                <span class="px-3 py-1">...</span>
                            {:else}
                                <button
                                    on:click={() => changePage(page)}
                                    class="px-3 py-1 rounded border {currentPage === page ? 'bg-[#FB773C] text-white' : 'hover:bg-gray-50'}"
                                >
                                    {page}
                                </button>
                            {/if}
                        {/each}
                        
                        <button
                            on:click={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            class="px-3 py-1 rounded border {currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'}"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
