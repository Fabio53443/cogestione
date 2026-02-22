<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    export let data;
    const { siteConfig, teachers } = data;
    
    let activeView = null;
    let listData = [];
    let loading = false;
    let error = null;
    let selectedCourses = [];
    
    // Pagination
    let pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
    
    // Search
    let searchQuery = '';
    let searchTimeout;

    // Sorting
    let sortColumn = null;
    let sortDirection = 'asc';

    function toggleSort(column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
    }

    $: sortedData = (() => {
        if (!sortColumn || !listData.length) return listData;
        return [...listData].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];
            // Handle nulls
            if (valA == null) valA = '';
            if (valB == null) valB = '';
            // Booleans
            if (typeof valA === 'boolean') {
                return sortDirection === 'asc' ? (valA === valB ? 0 : valA ? 1 : -1) : (valA === valB ? 0 : valA ? -1 : 1);
            }
            // Numbers
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }
            // Strings
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
    })();

    // Course creation modal
    let showCourseModal = false;
    let courseFormError = '';
    
    // Auto-load view from URL parameter
    onMount(() => {
        const viewParam = $page.url.searchParams.get('view');
        if (viewParam && ['students', 'courses', 'teachers'].includes(viewParam)) {
            fetchData(viewParam);
        }
    });
    let courseFormLoading = false;
    let courseForm = {
        nome: '',
        descrizione: '',
        aula: '',
        numPosti: '',
        length: 1,
        availability: [],
        docenteId: '',
        createNewDocente: false,
        newDocente: {
            nome: '',
            email: '',
            password: ''
        }
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

    function resetCourseForm() {
        courseForm = {
            nome: '',
            descrizione: '',
            aula: '',
            numPosti: '',
            length: 1,
            availability: [],
            docenteId: '',
            createNewDocente: false,
            newDocente: { nome: '', email: '', password: '' }
        };
        courseFormError = '';
    }

    function handleGiornoToggle(giornoId) {
        const index = courseForm.availability.indexOf(giornoId);
        if (index === -1) {
            courseForm.availability = [...courseForm.availability, giornoId];
        } else {
            courseForm.availability = courseForm.availability.filter(id => id !== giornoId);
        }
    }

    async function createCourse() {
        courseFormLoading = true;
        courseFormError = '';

        try {
            const payload = {
                nome: courseForm.nome,
                descrizione: courseForm.descrizione,
                aula: courseForm.aula,
                numPosti: parseInt(courseForm.numPosti),
                length: parseInt(courseForm.length),
                availability: courseForm.availability,
                docenteId: courseForm.createNewDocente ? null : parseInt(courseForm.docenteId),
                newDocente: courseForm.createNewDocente ? courseForm.newDocente : null
            };

            const response = await fetch('/api/admin/corso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                showCourseModal = false;
                resetCourseForm();
                if (activeView === 'courses') {
                    fetchData('courses', pagination.page);
                }
            } else {
                courseFormError = result.message;
            }
        } catch (e) {
            courseFormError = 'Errore durante la creazione del corso';
        }

        courseFormLoading = false;
    }

    async function fetchData(type, page = 1) {
        loading = true;
        error = null;
        sortColumn = null;
        sortDirection = 'asc';
        try {
            let url = `/api/admin/${type}?page=${page}&limit=${pagination.limit}`;
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                listData = data.items;
                pagination = data.pagination;
                activeView = type;
            } else {
                error = data.message;
            }
        } catch (e) {
            error = "Failed to fetch data";
        }
        loading = false;
    }

    function handleSearch(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (activeView) {
                fetchData(activeView, 1);
            }
        }, 300);
    }

    function goToPage(page) {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchData(activeView, page);
        }
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
                fetchData(activeView, pagination.page);
            } else {
                error = data.message;
            }
        } catch (e) {
            error = e.message;
        }        
    }

    async function deleteCourse(id) {
        if (!confirm("Vuoi veramente eliminare questo  corso?")) {
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
                const url = window.URL.createObjectURL(new Blob([data.file]));
                const link = document.createElement('a');
                link.href = url;
                link.download = `corso_${id}_deleted.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                fetchData(activeView, pagination.page);
            } else {
                error = data.message;
            }
        } catch (e) {
            error = e.message;
        }        
    }

    async function deleteDocente(id) {
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
                fetchData(activeView, pagination.page);
            } else {
                error = data.message;
            }
        } catch (e) {
            error = e.message;
        }        
    }

    // Password reset for organizers
    let resetPasswordModal = { show: false, docenteId: null, docenteName: '', docenteEmail: '', newPassword: '', generatedPassword: null, loading: false, error: null, success: false };
    let copiedField = null;

    function copyToClipboard(text, field) {
        navigator.clipboard.writeText(text);
        copiedField = field;
        setTimeout(() => { copiedField = null; }, 2000);
    }

    function openResetPasswordModal(id, name, email) {
        copiedField = null;
        resetPasswordModal = { show: true, docenteId: id, docenteName: name, docenteEmail: email, newPassword: '', generatedPassword: null, loading: false, error: null, success: false };
    }

    function closeResetPasswordModal() {
        resetPasswordModal = { show: false, docenteId: null, docenteName: '', docenteEmail: '', newPassword: '', generatedPassword: null, loading: false, error: null, success: false };
    }

    async function resetPassword(generate = false) {
        resetPasswordModal.loading = true;
        resetPasswordModal.error = null;
        resetPasswordModal.generatedPassword = null;

        try {
            const response = await fetch('/api/admin/docente', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: resetPasswordModal.docenteId,
                    password: generate ? undefined : resetPasswordModal.newPassword,
                    generate
                })
            });
            const data = await response.json();
            if (data.success) {
                resetPasswordModal.success = true;
                if (data.newPassword) {
                    resetPasswordModal.generatedPassword = data.newPassword;
                }
            } else {
                resetPasswordModal.error = data.message;
            }
        } catch (e) {
            resetPasswordModal.error = 'Errore durante il reset della password.';
        }

        resetPasswordModal.loading = false;
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

            const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'iscrizioni_corsi.zip';
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

<div class="max-w-6xl mx-auto px-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-white">Admin</h1>
        <div class="flex flex-wrap gap-2">
            <a 
                href="/admin/statistics" 
                class="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-2.5 px-5 rounded-xl border border-gray-700 transition-all duration-200"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Statistiche
            </a>
            <a 
                href="/admin/notifications" 
                class="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-2.5 px-5 rounded-xl border border-gray-700 transition-all duration-200"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                Notifiche
            </a>
            <a 
                href="/admin/settings" 
                class="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-2.5 px-5 rounded-xl border border-gray-700 transition-all duration-200"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Impostazioni
            </a>
        </div>
    </div>
    
    <!-- Quick nav buttons -->
    <div class="grid grid-cols-4 gap-3 mb-6">
        <button
            class="flex flex-col items-center gap-2 bg-[#252536] hover:bg-[#2d2d42] text-white font-medium py-4 px-4 rounded-xl border border-gray-700/50 transition-all duration-200 {activeView === 'students' ? 'ring-2 ring-[#FB773C]' : ''}"
            on:click={() => { searchQuery = ''; fetchData('students'); }}>
            <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span class="text-sm">Studenti</span>
        </button>
        <a
            href="/admin/classi"
            class="flex flex-col items-center gap-2 bg-[#252536] hover:bg-[#2d2d42] text-white font-medium py-4 px-4 rounded-xl border border-gray-700/50 transition-all duration-200">
            <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span class="text-sm">Classi</span>
        </a>
        <button
            class="flex flex-col items-center gap-2 bg-[#252536] hover:bg-[#2d2d42] text-white font-medium py-4 px-4 rounded-xl border border-gray-700/50 transition-all duration-200 {activeView === 'courses' ? 'ring-2 ring-[#FB773C]' : ''}"
            on:click={() => { searchQuery = ''; fetchData('courses'); }}>
            <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span class="text-sm">Corsi</span>
        </button>
        <button
            class="flex flex-col items-center gap-2 bg-[#252536] hover:bg-[#2d2d42] text-white font-medium py-4 px-4 rounded-xl border border-gray-700/50 transition-all duration-200 {activeView === 'teachers' ? 'ring-2 ring-[#FB773C]' : ''}"
            on:click={() => { searchQuery = ''; fetchData('teachers'); }}>
            <svg class="w-6 h-6 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span class="text-sm">Organizzatori</span>
        </button>
    </div>

    <!-- Create Course Button (only for courses view) -->
    {#if activeView === 'courses'}
        <div class="mb-6">
            <button
                class="inline-flex items-center gap-2 bg-[#FB773C] hover:bg-[#EB3678] text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200"
                on:click={() => { resetCourseForm(); showCourseModal = true; }}
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Crea Corso
            </button>
        </div>
    {/if}

    <!-- Search bar -->
    {#if activeView}
        <div class="mb-6">
            <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input
                    type="text"
                    bind:value={searchQuery}
                    on:input={handleSearch}
                    placeholder={activeView === 'students' ? 'Cerca studente per nome, email o classe...' : activeView === 'courses' ? 'Cerca corso per nome, descrizione o aula...' : 'Cerca organizzatore per nome o email...'}
                    class="w-full bg-[#252536] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                />
            </div>
        </div>
    {/if}

    {#if loading}
        <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-2 border-[#FB773C] border-t-transparent"></div>
        </div>
    {:else if error}
        <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
            {error}
        </div>
    {:else if activeView && listData.length > 0}
        <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden">
            {#if activeView === 'courses' && selectedCourses.length > 0}
                <div class="p-4 border-b border-gray-700/50 bg-blue-500/10">
                    <button
                        class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm"
                        on:click={downloadSelectedIscrizioni}>
                        Scarica iscrizioni ({selectedCourses.length})
                    </button>
                </div>
            {/if}
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-[#1e1e2e] text-gray-400 text-sm">
                        <tr>
                            {#if activeView === 'courses'}
                                <th class="px-4 py-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        class="rounded bg-transparent border-gray-600"
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
                            <th class="px-4 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" on:click={() => toggleSort('id')}>
                                <div class="flex items-center gap-1">
                                    ID
                                    {#if sortColumn === 'id'}
                                        <span class="text-[#FB773C]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    {/if}
                                </div>
                            </th>
                            <th class="px-4 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" on:click={() => toggleSort(activeView === 'courses' ? 'nome' : 'nomeCompleto')}>
                                <div class="flex items-center gap-1">
                                    Nome
                                    {#if sortColumn === 'nome' || sortColumn === 'nomeCompleto'}
                                        <span class="text-[#FB773C]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    {/if}
                                </div>
                            </th>
                            {#if activeView === 'students'}
                                <th class="px-4 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" on:click={() => toggleSort('classe')}>
                                    <div class="flex items-center gap-1">
                                        Classe
                                        {#if sortColumn === 'classe'}
                                            <span class="text-[#FB773C]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        {/if}
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" on:click={() => toggleSort('email')}>
                                    <div class="flex items-center gap-1">
                                        Email
                                        {#if sortColumn === 'email'}
                                            <span class="text-[#FB773C]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        {/if}
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" on:click={() => toggleSort('sdo')}>
                                    <div class="flex items-center gap-1">
                                        SdO
                                        {#if sortColumn === 'sdo'}
                                            <span class="text-[#FB773C]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        {/if}
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" on:click={() => toggleSort('holes')}>
                                    <div class="flex items-center gap-1">
                                        Buchi
                                        {#if sortColumn === 'holes'}
                                            <span class="text-[#FB773C]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        {/if}
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left">Azioni</th>
                            {:else if activeView === 'courses'}
                                <th class="px-4 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" on:click={() => toggleSort('aula')}>
                                    <div class="flex items-center gap-1">
                                        Aula
                                        {#if sortColumn === 'aula'}
                                            <span class="text-[#FB773C]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        {/if}
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left">Azioni</th>
                            {:else if activeView === 'teachers'}
                                <th class="px-4 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" on:click={() => toggleSort('email')}>
                                    <div class="flex items-center gap-1">
                                        Email
                                        {#if sortColumn === 'email'}
                                            <span class="text-[#FB773C]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        {/if}
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left">
                                    <a href="/admin/docenti/create" class="text-green-400 hover:text-green-300 text-sm font-medium">
                                        + Aggiungi
                                    </a>
                                </th>
                            {/if}
                        </tr>
                    </thead>
                    <tbody class="text-gray-300">
                        {#each sortedData as item}
                            <tr class="border-t border-gray-700/50 hover:bg-white/5">
                                {#if activeView === 'courses'}
                                    <td class="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-transparent border-gray-600"
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
                                <td class="px-4 py-3 text-gray-500 text-sm">{item.id}</td>
                                <td class="px-4 py-3 text-white font-medium">
                                    {#if activeView === 'students'}
                                        <a href="/admin/studenti/{item.id}" class="hover:text-[#FB773C] transition-colors">
                                            {item.nomeCompleto}
                                        </a>
                                    {:else}
                                        {item.nomeCompleto || item.nome}
                                    {/if}
                                </td>
                                {#if activeView === 'students'}
                                    <td class="px-4 py-3 text-gray-400">{item.classe || '—'}</td>
                                    <td class="px-4 py-3 text-gray-400">{item.email}</td>
                                    <td class="px-4 py-3 text-center">
                                        {#if item.sdo}
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">SdO</span>
                                        {:else}
                                            <span class="text-gray-600">—</span>
                                        {/if}
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        {#if item.holes > 0}
                                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-red-500/20 text-red-400">{item.holes}</span>
                                        {:else}
                                            <span class="text-green-400 text-sm">0</span>
                                        {/if}
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            <a
                                                class="text-[#FB773C] hover:text-[#EB3678] text-sm font-medium"
                                                href="/admin/studenti/{item.id}">
                                                Dettagli
                                            </a>
                                        </div>
                                    </td>
                                {:else if activeView === 'courses'}
                                    <td class="px-4 py-3 text-gray-400">{item.aula}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <a href="/admin/corsi/{item.id}" class="text-[#FB773C] hover:text-[#EB3678] text-sm font-medium">
                                                Gestisci
                                            </a>
                                            <a href="/api/admin/corso/pdf-iscrizioni/{item.id}" class="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                                PDF
                                            </a>
                                            <button
                                                class="text-red-400 hover:text-red-300 text-sm font-medium"
                                                on:click={() => deleteCourse(item.id)}>
                                                Elimina
                                            </button>
                                        </div>
                                    </td>
                                {:else if activeView === 'teachers'}
                                    <td class="px-4 py-3 text-gray-400">{item.email}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <a href="/admin/docenti/{item.id}" class="text-[#FB773C] hover:text-[#EB3678] text-sm font-medium">
                                                Impersona
                                            </a>
                                            <button
                                                class="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                                on:click={() => openResetPasswordModal(item.id, item.nomeCompleto, item.email)}>
                                                Reset Password
                                            </button>
                                            <button
                                                class="text-red-400 hover:text-red-300 text-sm font-medium"
                                                on:click={() => deleteDocente(item.id)}>
                                                Elimina
                                            </button>
                                        </div>
                                    </td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            {#if pagination.totalPages > 1}
                <div class="px-4 py-3 border-t border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div class="text-sm text-gray-500">
                        Pagina {pagination.page} di {pagination.totalPages} ({pagination.total} totali)
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            class="p-2 rounded-lg bg-[#1e1e2e] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pagination.page === 1}
                            on:click={() => goToPage(pagination.page - 1)}
                            aria-label="Pagina precedente"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        {#each Array(Math.min(5, pagination.totalPages)).fill(0).map((_, i) => {
                            const start = Math.max(1, pagination.page - 2);
                            const end = Math.min(pagination.totalPages, start + 4);
                            const actualStart = Math.max(1, end - 4);
                            return actualStart + i;
                        }).filter(p => p <= pagination.totalPages) as page}
                            <button
                                class="w-10 h-10 rounded-lg text-sm font-medium transition-colors {page === pagination.page ? 'bg-[#FB773C] text-white' : 'bg-[#1e1e2e] text-gray-400 hover:text-white'}"
                                on:click={() => goToPage(page)}
                            >
                                {page}
                            </button>
                        {/each}
                        <button
                            class="p-2 rounded-lg bg-[#1e1e2e] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pagination.page === pagination.totalPages}
                            on:click={() => goToPage(pagination.page + 1)}
                            aria-label="Pagina successiva"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {:else if activeView}
        <div class="bg-[#252536] rounded-2xl p-8 text-center border border-gray-700/50">
            <p class="text-gray-400">
                {#if searchQuery}
                    Nessun risultato per "{searchQuery}"
                {:else}
                    Nessun dato disponibile
                {/if}
            </p>
        </div>
    {/if}
</div>

<!-- Course Creation Modal -->
{#if showCourseModal}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" on:click|self={() => showCourseModal = false}>
        <div class="bg-[#252536] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700/50">
            <div class="flex items-center justify-between p-5 border-b border-gray-700/50">
                <h2 class="text-xl font-bold text-white">Crea Nuovo Corso</h2>
                <button 
                    class="text-gray-400 hover:text-white transition-colors"
                    on:click={() => showCourseModal = false}
                    aria-label="Chiudi"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <form on:submit|preventDefault={createCourse} class="p-5 space-y-4">
                {#if courseFormError}
                    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                        {courseFormError}
                    </div>
                {/if}

                <!-- Nome -->
                <div>
                    <label class="block text-gray-400 text-sm font-medium mb-2" for="nome">Nome del Corso</label>
                    <input
                        type="text"
                        id="nome"
                        bind:value={courseForm.nome}
                        required
                        class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                        placeholder="Es. Laboratorio di Fisica"
                    />
                </div>

                <!-- Descrizione -->
                <div>
                    <label class="block text-gray-400 text-sm font-medium mb-2" for="descrizione">Descrizione</label>
                    <textarea
                        id="descrizione"
                        bind:value={courseForm.descrizione}
                        required
                        rows="3"
                        class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors resize-none"
                        placeholder="Descrizione del corso..."
                    ></textarea>
                </div>

                <!-- Aula e Posti -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-400 text-sm font-medium mb-2" for="aula">Aula</label>
                        <input
                            type="text"
                            id="aula"
                            bind:value={courseForm.aula}
                            required
                            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                            placeholder="Es. Lab 1"
                        />
                    </div>
                    <div>
                        <label class="block text-gray-400 text-sm font-medium mb-2" for="numPosti">Posti</label>
                        <input
                            type="number"
                            id="numPosti"
                            bind:value={courseForm.numPosti}
                            required
                            min="1"
                            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                            placeholder="25"
                        />
                    </div>
                </div>

                <!-- Durata -->
                <div>
                    <label class="block text-gray-400 text-sm font-medium mb-2" for="length">Durata (ore)</label>
                    <select
                        id="length"
                        bind:value={courseForm.length}
                        class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                    >
                        {#each Array(maxCourseLength).fill(0).map((_, i) => i + 1) as len}
                            <option value={len}>{len} {len === 1 ? 'ora' : 'ore'}</option>
                        {/each}
                    </select>
                </div>

                <!-- Giorni -->
                <div>
                    <span class="block text-gray-400 text-sm font-medium mb-2">Giorni disponibili</span>
                    <div class="flex flex-wrap gap-2">
                        {#each giorni as giorno}
                            <button
                                type="button"
                                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {courseForm.availability.includes(giorno.id) ? 'bg-[#FB773C] text-white' : 'bg-[#1e1e2e] text-gray-400 hover:text-white border border-gray-700'}"
                                on:click={() => handleGiornoToggle(giorno.id)}
                            >
                                {giorno.name.slice(0, 3)}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Organizzatore -->
                <div>
                    <span class="block text-gray-400 text-sm font-medium mb-2">Organizzatore</span>
                    
                    <div class="flex items-center gap-3 mb-3">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="docenteType"
                                checked={!courseForm.createNewDocente}
                                on:change={() => courseForm.createNewDocente = false}
                                class="text-[#FB773C] focus:ring-[#FB773C]"
                            />
                            <span class="text-gray-300 text-sm">Esistente</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="docenteType"
                                checked={courseForm.createNewDocente}
                                on:change={() => courseForm.createNewDocente = true}
                                class="text-[#FB773C] focus:ring-[#FB773C]"
                            />
                            <span class="text-gray-300 text-sm">Nuovo</span>
                        </label>
                    </div>

                    {#if !courseForm.createNewDocente}
                        <select
                            bind:value={courseForm.docenteId}
                            required={!courseForm.createNewDocente}
                            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                        >
                            <option value="">Seleziona organizzatore...</option>
                            {#each teachers as teacher}
                                <option value={teacher.id}>{teacher.nomeCompleto} ({teacher.email})</option>
                            {/each}
                        </select>
                    {:else}
                        <div class="space-y-3 bg-[#1e1e2e] rounded-xl p-4 border border-gray-700">
                            <input
                                type="text"
                                bind:value={courseForm.newDocente.nome}
                                required={courseForm.createNewDocente}
                                class="w-full bg-[#252536] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] text-sm"
                                placeholder="Nome completo"
                            />
                            <input
                                type="email"
                                bind:value={courseForm.newDocente.email}
                                required={courseForm.createNewDocente}
                                class="w-full bg-[#252536] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] text-sm"
                                placeholder="Email"
                            />
                            <input
                                type="password"
                                bind:value={courseForm.newDocente.password}
                                required={courseForm.createNewDocente}
                                class="w-full bg-[#252536] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] text-sm"
                                placeholder="Password"
                            />
                        </div>
                    {/if}
                </div>

                <!-- Actions -->
                <div class="flex gap-3 pt-4">
                    <button
                        type="button"
                        class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                        on:click={() => showCourseModal = false}
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        disabled={courseFormLoading}
                        class="flex-1 bg-[#FB773C] hover:bg-[#EB3678] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {#if courseFormLoading}
                            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        {:else}
                            Crea Corso
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Reset Password Modal -->
{#if resetPasswordModal.show}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
     on:click|self={closeResetPasswordModal}>
    <div class="bg-[#252536] rounded-2xl w-full max-w-md shadow-2xl border border-gray-700/50">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
            <div>
                <h2 class="text-lg font-bold text-white">Reset Password</h2>
                <p class="text-sm text-gray-400 mt-0.5">{resetPasswordModal.docenteName}</p>
                <p class="text-xs text-gray-500">{resetPasswordModal.docenteEmail}</p>
            </div>
            <button on:click={closeResetPasswordModal} class="text-gray-400 hover:text-white transition-colors" title="Chiudi">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <div class="px-6 py-5 space-y-4">
            {#if resetPasswordModal.success}
                <!-- Success state -->
                <div class="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                    Password aggiornata con successo!
                </div>
                {#if resetPasswordModal.generatedPassword}
                    <div class="bg-[#1e1e2e] rounded-xl p-4 border border-gray-700/50 space-y-3">
                        <div>
                            <p class="text-gray-400 text-xs mb-2">Email:</p>
                            <div class="flex items-center gap-2">
                                <code class="flex-1 text-white text-sm font-mono bg-[#252536] px-3 py-2 rounded-lg select-all">
                                    {resetPasswordModal.docenteEmail}
                                </code>
                                <button 
                                    class="p-2 bg-[#252536] rounded-lg transition-all duration-300 {copiedField === 'email' ? 'text-green-400' : 'text-gray-400 hover:text-white'}"
                                    title={copiedField === 'email' ? 'Copiato!' : 'Copia'}
                                    on:click={() => copyToClipboard(resetPasswordModal.docenteEmail, 'email')}
                                >
                                    {#if copiedField === 'email'}
                                        <svg class="w-5 h-5 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                        </svg>
                                    {:else}
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                        </svg>
                                    {/if}
                                </button>
                            </div>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs mb-2">Nuova password (copiala ora, non verrà mostrata di nuovo):</p>
                            <div class="flex items-center gap-2">
                                <code class="flex-1 text-white text-lg font-mono bg-[#252536] px-3 py-2 rounded-lg select-all">
                                    {resetPasswordModal.generatedPassword}
                                </code>
                                <button 
                                    class="p-2 bg-[#252536] rounded-lg transition-all duration-300 {copiedField === 'password' ? 'text-green-400' : 'text-gray-400 hover:text-white'}"
                                    title={copiedField === 'password' ? 'Copiato!' : 'Copia'}
                                    on:click={() => copyToClipboard(resetPasswordModal.generatedPassword, 'password')}
                                >
                                    {#if copiedField === 'password'}
                                        <svg class="w-5 h-5 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                        </svg>
                                    {:else}
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                        </svg>
                                    {/if}
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}
                <div class="flex justify-end">
                    <button
                        class="px-4 py-2 bg-[#FB773C] hover:bg-[#EB3678] text-white font-medium rounded-xl transition-colors"
                        on:click={closeResetPasswordModal}
                    >
                        Chiudi
                    </button>
                </div>
            {:else}
                <!-- Form state -->
                {#if resetPasswordModal.error}
                    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                        {resetPasswordModal.error}
                    </div>
                {/if}

                <!-- Generate password button -->
                <button
                    class="w-full px-4 py-3 bg-[#FB773C] hover:bg-[#EB3678] text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    on:click={() => resetPassword(true)}
                    disabled={resetPasswordModal.loading}
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Genera password casuale
                </button>

                <div class="flex items-center gap-3">
                    <div class="flex-1 h-px bg-gray-700"></div>
                    <span class="text-gray-500 text-xs uppercase">oppure</span>
                    <div class="flex-1 h-px bg-gray-700"></div>
                </div>

                <!-- Manual password input -->
                <div>
                    <label class="block text-sm text-gray-400 mb-1.5" for="reset-password-input">Imposta manualmente</label>
                    <input
                        id="reset-password-input"
                        type="text"
                        bind:value={resetPasswordModal.newPassword}
                        placeholder="Nuova password"
                        class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors text-sm"
                    />
                </div>
                <button
                    class="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    on:click={() => resetPassword(false)}
                    disabled={resetPasswordModal.loading || !resetPasswordModal.newPassword}
                >
                    {resetPasswordModal.loading ? 'Salvando...' : 'Imposta password'}
                </button>
            {/if}
        </div>
    </div>
</div>
{/if}

<style>
    @keyframes checkmark {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
    }
    :global(.animate-check) {
        animation: checkmark 0.3s ease-out forwards;
    }
</style>