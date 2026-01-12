<script>
    import { onMount } from "svelte";
    
    let notifications = [];
    let loading = true;
    let error = null;
    
    // Modal state
    let showModal = false;
    let editingNotification = null;
    let formLoading = false;
    let formError = "";
    
    let form = {
        title: "",
        message: "",
        type: "info",
        visibility: "everyone",
    };
    
    const typeOptions = [
        { value: "info", label: "Info", color: "blue" },
        { value: "success", label: "Successo", color: "green" },
        { value: "warning", label: "Avviso", color: "yellow" },
        { value: "error", label: "Errore", color: "red" },
    ];
    
    const visibilityOptions = [
        { value: "everyone", label: "Tutti (anche non registrati)" },
        { value: "signed_in", label: "Solo utenti registrati" },
        { value: "studenti", label: "Solo studenti" },
        { value: "docenti", label: "Solo docenti" },
    ];
    
    const typeStyles = {
        success: "bg-green-500/20 text-green-400",
        error: "bg-red-500/20 text-red-400",
        warning: "bg-yellow-500/20 text-yellow-400",
        info: "bg-blue-500/20 text-blue-400",
    };
    
    const visibilityLabels = {
        everyone: "Tutti",
        signed_in: "Registrati",
        studenti: "Studenti",
        docenti: "Docenti",
    };
    
    onMount(() => {
        loadNotifications();
    });
    
    async function loadNotifications() {
        loading = true;
        error = null;
        try {
            const response = await fetch("/api/admin/notifications");
            const result = await response.json();
            if (result.success) {
                notifications = result.notifications;
            } else {
                error = result.message;
            }
        } catch (e) {
            error = "Errore nel caricamento delle notifiche";
        }
        loading = false;
    }
    
    function openCreateModal() {
        editingNotification = null;
        form = {
            title: "",
            message: "",
            type: "info",
            visibility: "everyone",
        };
        formError = "";
        showModal = true;
    }
    
    function openEditModal(notification) {
        editingNotification = notification;
        form = {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            visibility: notification.visibility,
        };
        formError = "";
        showModal = true;
    }
    
    function closeModal() {
        showModal = false;
        editingNotification = null;
        formError = "";
    }
    
    async function saveNotification() {
        if (!form.title.trim() || !form.message.trim()) {
            formError = "Titolo e messaggio sono obbligatori";
            return;
        }
        
        formLoading = true;
        formError = "";
        
        try {
            const method = editingNotification ? "PUT" : "POST";
            const body = editingNotification 
                ? { id: editingNotification.id, ...form }
                : form;
            
            const response = await fetch("/api/admin/notifications", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            
            const result = await response.json();
            
            if (result.success) {
                closeModal();
                loadNotifications();
            } else {
                formError = result.message;
            }
        } catch (e) {
            formError = "Errore nel salvataggio";
        }
        
        formLoading = false;
    }
    
    async function toggleActive(notification) {
        try {
            const response = await fetch("/api/admin/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: notification.id, active: !notification.active }),
            });
            
            const result = await response.json();
            if (result.success) {
                notification.active = !notification.active;
                notifications = [...notifications];
            }
        } catch (e) {
            console.error("Error toggling notification:", e);
        }
    }
    
    async function deleteNotification(notification) {
        if (!confirm(`Sei sicuro di voler eliminare la notifica "${notification.title}"?`)) {
            return;
        }
        
        try {
            const response = await fetch("/api/admin/notifications", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: notification.id }),
            });
            
            const result = await response.json();
            if (result.success) {
                notifications = notifications.filter(n => n.id !== notification.id);
            }
        } catch (e) {
            console.error("Error deleting notification:", e);
        }
    }
</script>

<div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
            <a href="/admin" class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Torna all'admin
            </a>
            <h1 class="text-2xl font-bold text-white">Gestione Notifiche</h1>
            <p class="text-gray-400 text-sm mt-1">Crea e gestisci le notifiche visibili agli utenti</p>
        </div>
        <button
            on:click={openCreateModal}
            class="flex items-center gap-2 bg-[#FB773C] hover:bg-[#EB3678] text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Nuova Notifica
        </button>
    </div>
    
    {#if loading}
        <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-2 border-[#FB773C] border-t-transparent"></div>
        </div>
    {:else if error}
        <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
            {error}
        </div>
    {:else if notifications.length === 0}
        <div class="bg-[#252536] rounded-2xl p-8 md:p-12 text-center border border-gray-700/50">
            <div class="w-16 h-16 bg-[#FB773C]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-[#FB773C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </div>
            <p class="text-gray-300 text-lg mb-2">Nessuna notifica</p>
            <p class="text-gray-500 text-sm">Crea la prima notifica per comunicare con gli utenti</p>
        </div>
    {:else}
        <div class="space-y-4">
            {#each notifications as notification (notification.id)}
                <div class="bg-[#252536] rounded-2xl border border-gray-700/50 overflow-hidden {!notification.active ? 'opacity-60' : ''}">
                    <div class="p-5">
                        <div class="flex items-start gap-4">
                            <div class="flex-grow min-w-0">
                                <div class="flex flex-wrap items-center gap-2 mb-2">
                                    <h3 class="text-lg font-semibold text-white">{notification.title}</h3>
                                    <span class={`text-xs font-medium px-2 py-0.5 rounded ${typeStyles[notification.type]}`}>
                                        {typeOptions.find(t => t.value === notification.type)?.label || notification.type}
                                    </span>
                                    <span class="text-xs font-medium px-2 py-0.5 rounded bg-gray-600/30 text-gray-300">
                                        {visibilityLabels[notification.visibility]}
                                    </span>
                                    {#if !notification.active}
                                        <span class="text-xs font-medium px-2 py-0.5 rounded bg-gray-600/30 text-gray-500">
                                            Disattivata
                                        </span>
                                    {/if}
                                </div>
                                <p class="text-gray-400 text-sm">{notification.message}</p>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <!-- Toggle Active -->
                                <button
                                    on:click={() => toggleActive(notification)}
                                    class="p-2 rounded-lg transition-colors {notification.active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-600/30 text-gray-400 hover:bg-gray-600/50'}"
                                    title={notification.active ? "Disattiva" : "Attiva"}
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {#if notification.active}
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        {:else}
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                        {/if}
                                    </svg>
                                </button>
                                <!-- Edit -->
                                <button
                                    on:click={() => openEditModal(notification)}
                                    class="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                    title="Modifica"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                </button>
                                <!-- Delete -->
                                <button
                                    on:click={() => deleteNotification(notification)}
                                    class="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    title="Elimina"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-[#252536] rounded-2xl border border-gray-700/50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">
                        {editingNotification ? "Modifica Notifica" : "Nuova Notifica"}
                    </h2>
                    <button
                        on:click={closeModal}
                        class="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                
                {#if formError}
                    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4">
                        {formError}
                    </div>
                {/if}
                
                <div class="space-y-4">
                    <!-- Title -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Titolo</label>
                        <input
                            type="text"
                            bind:value={form.title}
                            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors"
                            placeholder="Titolo della notifica"
                        />
                    </div>
                    
                    <!-- Message -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Messaggio</label>
                        <textarea
                            bind:value={form.message}
                            rows="3"
                            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] transition-colors resize-none"
                            placeholder="Contenuto della notifica"
                        ></textarea>
                    </div>
                    
                    <!-- Type -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {#each typeOptions as type}
                                <button
                                    type="button"
                                    on:click={() => form.type = type.value}
                                    class="px-3 py-2 rounded-xl text-sm font-medium transition-all {form.type === type.value ? typeStyles[type.value] + ' ring-2 ring-offset-2 ring-offset-[#252536]' : 'bg-[#1e1e2e] text-gray-400 hover:text-white'}"
                                    class:ring-green-500={form.type === type.value && type.value === 'success'}
                                    class:ring-red-500={form.type === type.value && type.value === 'error'}
                                    class:ring-yellow-500={form.type === type.value && type.value === 'warning'}
                                    class:ring-blue-500={form.type === type.value && type.value === 'info'}
                                >
                                    {type.label}
                                </button>
                            {/each}
                        </div>
                    </div>
                    
                    <!-- Visibility -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Visibilità</label>
                        <select
                            bind:value={form.visibility}
                            class="w-full bg-[#1e1e2e] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FB773C] transition-colors"
                        >
                            {#each visibilityOptions as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                
                <div class="flex gap-3 mt-6">
                    <button
                        on:click={closeModal}
                        class="flex-1 bg-gray-600/30 hover:bg-gray-600/50 text-gray-300 font-medium px-4 py-3 rounded-xl transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        on:click={saveNotification}
                        disabled={formLoading}
                        class="flex-1 bg-[#FB773C] hover:bg-[#EB3678] text-white font-medium px-4 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {#if formLoading}
                            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        {:else}
                            {editingNotification ? "Salva" : "Crea"}
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}
