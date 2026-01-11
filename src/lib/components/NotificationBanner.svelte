<script>
    import { onMount } from "svelte";
    
    let notifications = [];
    let dismissedIds = [];
    
    onMount(async () => {
        // Load dismissed notifications from localStorage
        const stored = localStorage.getItem("dismissedNotifications");
        if (stored) {
            try {
                dismissedIds = JSON.parse(stored);
            } catch (e) {
                dismissedIds = [];
            }
        }
        
        await loadNotifications();
    });
    
    async function loadNotifications() {
        try {
            const response = await fetch("/api/notifications");
            const result = await response.json();
            if (result.success) {
                // Filter out dismissed notifications
                notifications = result.notifications.filter(n => !dismissedIds.includes(n.id));
            }
        } catch (e) {
            console.error("Failed to load notifications:", e);
        }
    }
    
    function dismissNotification(id) {
        dismissedIds = [...dismissedIds, id];
        localStorage.setItem("dismissedNotifications", JSON.stringify(dismissedIds));
        notifications = notifications.filter(n => n.id !== id);
    }
    
    const typeStyles = {
        success: "bg-green-500/10 text-green-400 border-green-500/30",
        error: "bg-red-500/10 text-red-400 border-red-500/30",
        warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
        info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    };
    
    const typeIcons = {
        success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
        warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    };
</script>

{#if notifications.length > 0}
    <div class="space-y-3 mb-6">
        {#each notifications as notification (notification.id)}
            <div class={`border ${typeStyles[notification.type] || typeStyles.info} px-4 py-3 rounded-xl backdrop-blur-sm`} role="alert">
                <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={typeIcons[notification.type] || typeIcons.info}/>
                    </svg>
                    <div class="flex-grow min-w-0">
                        <h4 class="font-semibold text-sm">{notification.title}</h4>
                        <p class="text-sm opacity-90 mt-1">{notification.message}</p>
                    </div>
                    <button
                        on:click={() => dismissNotification(notification.id)}
                        class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1"
                        aria-label="Chiudi notifica"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        {/each}
    </div>
{/if}
