<!-- src/lib/components/Alert.svelte -->
<script>
    export let type = ""; // can be 'success', 'error', 'warning', or 'info'
    export let message = "";
    export let show = false; // controls whether the alert is visible
    const alertTypes = {
        success: "bg-green-500/10 text-green-400 border-green-500/30",
        error: "bg-red-500/10 text-red-400 border-red-500/30",
        warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
        info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    };
    $: alertStyle = alertTypes[type] || alertTypes.info;
</script>

{#if show}
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div class={`border ${alertStyle} px-4 py-3 rounded-xl backdrop-blur-sm flex items-center justify-between gap-4`} role="alert">
            <span class="text-sm font-medium">{message}</span>
            <button
                on:click={() => (show = false)}
                class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Chiudi"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    </div>
{/if}
