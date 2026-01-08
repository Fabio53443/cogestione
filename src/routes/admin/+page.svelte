<script>
    let activeView = null;
    let listData = [];
    let loading = false;
    let error = null;
    let selectedCourses = [];

    async function fetchData(type) {
        loading = true;
        error = null;
        try {
            const response = await fetch(`/api/admin/${type}`);
            const data = await response.json();
            if (data.success) {
                listData = data.items;
                activeView = type;
            } else {
                error = data.message;
            }
        } catch (e) {
            error = "Failed to fetch data";
        }
        loading = false;
    }

    async function adminStatus(id) {
        try {
            const response = await fetch(`/api/admin/sdo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.success) {
                fetchData(activeView);
            } else {
                error = data.message;
            }
        } catch (e) {
            error = e.message;
        }        
    }

    async function deleteCourse(id) {
        //show a confirmation dialog
        if (!confirm("Vuoi veramente eliminare questo corso?")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/corso/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.success) {
                //download the file
                const url = window.URL.createObjectURL(new Blob([data.file]));
                const link = document.createElement('a');
                link.href = url;
                link.download = `corso_${id}_deleted.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                fetchData(activeView);
            } else {
                error = data.message;
            }
        } catch (e) {
            error = e.message;
        }        
    }

    async function getIscrizioni(id) {
        try {
            const response = await fetch(`/api/admin/corso/pdf-iscrizioni`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ courseId: id }),
            });
            const data = await response.json();
            if (data.success) {
                fetchData(activeView);
            } else {
                error = data.message;
            }
        } catch (e) {
            error = e.message;
        }        

        
    }

    async function deleteDocente(id) {
        //show a confirmation dialog
        if (!confirm("Vuoi veramente eliminare questo organizzatore?")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/docente`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.success) {
                fetchData(activeView);
            } else {
                error = data.message;
            }
        } catch (e) {
            error = e.message;
        }        
    }

    async function downloadSelectedIscrizioni() {
        if (selectedCourses.length === 0) {
            alert("Seleziona almeno un corso");
            return;
        }

        try {
            const response = await fetch(`/api/admin/corso/pdf-iscrizioni-bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ courseIds: selectedCourses }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                error = errorData.message || "Download failed";
                return;
            }

            // Get the filename from the Content-Disposition header
            const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'iscrizioni_corsi.zip';
            
            // Create a blob from the binary data
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            error = e.message;
        }
    }
</script>

<div class="container mx-auto px-4 py-8">
    <div class="bg-white shadow-lg rounded-lg p-6">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-[#FB773C]">Dashboard Amministratore</h1>
            <a 
                href="/admin/settings" 
                class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
            >
                ⚙️ Impostazioni
            </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
                class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                on:click={() => fetchData('students')}>
                Studenti
            </button>
            <button
                class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                on:click={() => fetchData('courses')}>
                Corsi
            </button>
            <button
                class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                on:click={() => fetchData('teachers')}>
                Organizzatori
            </button>
        </div>

        {#if loading}
            <div class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FB773C] mx-auto"></div>
            </div>
        {:else if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        {:else if activeView && listData.length > 0}
            <div class="overflow-x-auto text-gray-700">
                {#if activeView === 'courses' && selectedCourses.length > 0}
                    <div class="mb-4">
                        <button
                            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            on:click={downloadSelectedIscrizioni}>
                            Scarica iscrizioni selezionate ({selectedCourses.length})
                        </button>
                    </div>
                {/if}
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-100">
                        <tr>
                            {#if activeView === 'courses'}
                                <th class="px-6 py-3 text-left text-gray-700">
                                    <input
                                        type="checkbox"
                                        on:change={(e) => {
                                            if (e.target.checked) {
                                                selectedCourses = listData.map(item => item.id);
                                            } else {
                                                selectedCourses = [];
                                            }
                                        }}
                                    />
                                </th>
                            {/if}
                            <th class="px-6 py-3 text-left text-gray-700">ID</th>
                            <th class="px-6 py-3 text-left text-gray-700">Nome</th>
                            {#if activeView === 'students'}
                                <th class="px-6 py-3 text-left text-gray-700">Email</th>
                                <th class="px-6 py-3 text-left text-gray-700">Admin</th>
                                <th class="px-6 py-3 text-left text-gray-700">SdO</th>
                                <th class="px-6 py-3 text-left text-gray-700">Gestisci</th>
                                <th class="px-6 py-3 text-left text-gray-700">
                                    <a href="/admin/sdo" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                        Corsi
                                    </a>
                                </th>
                            {:else if activeView === 'courses'}
                                <th class="px-6 py-3 text-left text-gray-700">Aula</th>
                                <th class="px-6 py-3 text-left text-gray-700">Gestisci</th>
                                <th class="px-6 py-3 text-left text-gray-700">Elimina</th>
                                <th class="px-6 py-3 text-left text-gray-700">Iscrizioni</th>                                
                            {:else if activeView === 'teachers'}
                            <th class="px-6 py-3 text-left text-gray-700">Email</th>
                                <th class="px-6 py-3 text-left text-gray-700">
                                    <a href="/admin/docenti/create" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                        Aggiungi
                                    </a>
                                </th>
                                <th class="px-6 py-3 text-left text-gray-700">Elimina</th>

                            {/if}
                        </tr>
                    </thead>
                    <tbody>
                        {#each listData as item}
                            <tr class="border-t hover:bg-gray-50">
                                {#if activeView === 'courses'}
                                    <td class="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(item.id)}
                                            on:change={(e) => {
                                                if (e.target.checked) {
                                                    selectedCourses = [...selectedCourses, item.id];
                                                } else {
                                                    selectedCourses = selectedCourses.filter(id => id !== item.id);
                                                }
                                            }}
                                        />
                                    </td>
                                {/if}
                                <td class="px-6 py-4 text-gray-700">{item.id}</td>
                                <td class="px-6 py-4 text-gray-700">{item.nomeCompleto || item.nome}</td>
                                {#if activeView === 'students'}
                                    <td class="px-6 py-4" text-gray-700>{item.email}</td>
                                    <td class="px-6 py-4 text-gray-700">
                                        <span class={item.admin ? "text-green-600" : "text-red-600"}>
                                            {item.admin ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-gray-700">
                                        <span class={item.sdo ? "text-green-600" : "text-red-600"}>
                                            {item.sdo ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <th class="px-6 py-3 text-left text-gray-700 ">
                                        <button
                                            class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded"
                                            on:click={() => adminStatus(item.id)}>
                                            {item.sdo ? "Rimuovi da SdO" : "Promuovi a SdO"}
                                        </button>
                                    </th>
                                    <th class="px-6 py-3 text-left text-gray-700 ">
                                        <a
                                            class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded"
                                            href="/admin/sdo/{item.id}">
                                            Corsi
                                    </a>
                                    </th>
                                {:else if activeView === 'courses'}
                                    <td class="px-6 py-4 text-gray-700">{item.aula}</td>
                                    
                                    <th class="px-6 py-3 text-left text-gray-700 ">
                                        <a href="/admin/corsi/{item.id}" class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded">
                                            Gestisci
                                        </a>
                                    </th>
    
                                    
                                    <th class="px-6 py-3 text-left text-gray-700 ">
                                        <button
                                            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                            on:click={() => deleteCourse(item.id)}>
                                            Elimina
                                        </button>
                                    </th>
                                    
                                    <th class="px-6 py-3 text-left text-gray-700 ">
                                        <a href="/api/admin/corso/pdf-iscrizioni/{item.id}" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                                            Iscrizioni
                                        </a>
                                    </th>

                                {:else if activeView === 'teachers'}
                                    <td class="px-6 py-4 text-gray-700 ">{item.email}</td>
                                    <th class="px-6 py-3 text-left text-gray-700 ">
                                        <a href="/admin/docenti/{item.id}" class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded">
                                            Impersona
                                        </a>
                                    </th>
                                    <th class="px-6 py-3 text-left text-gray-700 ">
                                        <button
                                            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                            on:click={() => deleteDocente(item.id)}>
                                            Elimina
                                        </button>
                                    </th>
    
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {:else if activeView}
            <div class="text-center py-8 text-gray-600">
                No data available
            </div>
        {/if}
    </div>
</div>
