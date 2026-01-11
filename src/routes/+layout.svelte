<script>
    import "../app.css";
    import favicon from "../favicon.png";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import {
        HomeOutline,
        UserCircleOutline,
        ArrowLeftToBracketOutline,
        ArrowRightToBracketOutline,
        UserSettingsOutline,
        DotsVerticalOutline,
    } from "flowbite-svelte-icons";
    import NotificationBanner from "$lib/components/NotificationBanner.svelte";
    
    $: pageName = $page.data.pageName;
    $: user = $page.data.user;

    // Added dropdown toggle for student user
    let dropdownOpen = false;
</script>

<svelte:head>
    <title>{pageName}</title>
</svelte:head>

<main
    class="min-h-screen flex flex-col bg-gradient-to-br from-[#1e1e2e] to-[#181825]"
>
    <header class="bg-[#1e1e2e]/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    {#if pageName != "Autogestione"}
                        <a
                            href="/"
                            class="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                            aria-label="Home"
                        >
                            <HomeOutline class="w-5 h-5" />
                        </a>
                    {/if}
                    <h1 class="text-lg md:text-xl font-semibold text-white truncate max-w-[200px] md:max-w-none">
                        {pageName}
                    </h1>
                </div>
                {#if !user}
                    <a
                        href="/login"
                        class="flex items-center gap-2 bg-[#FB773C] hover:bg-[#EB3678] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        Accedi
                    </a>
                {:else if user.role === "studente"}
                    <div class="relative">
                        <button
                            on:click={() => (dropdownOpen = !dropdownOpen)}
                            class="flex items-center gap-2 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
                        >
                            <UserCircleOutline class="w-5 h-5" />
                            <span class="hidden sm:inline">Menu</span>
                            <DotsVerticalOutline class="w-4 h-4" />
                        </button>
                        {#if dropdownOpen}
                            <div class="absolute right-0 mt-2 w-48 bg-[#252536] border border-gray-700 shadow-xl rounded-xl overflow-hidden">
                                <a
                                    href="/studente/profile"
                                    class="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <UserCircleOutline class="w-4 h-4" /> Profilo
                                </a>
                                <a
                                    href="/logout"
                                    class="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <ArrowRightToBracketOutline class="w-4 h-4" /> Esci
                                </a>
                            </div>
                        {/if}
                    </div>
                {:else if user.role === "docente"}
                    <a
                        href="/logout"
                        class="flex items-center gap-2 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        <ArrowRightToBracketOutline class="w-4 h-4" />
                        <span>Esci</span>
                    </a>
                {/if}
            </div>
        </div>
    </header>

    <div class="flex-grow container mx-auto px-4 py-8">
        <NotificationBanner />
        <slot></slot>
    </div>

    <footer class="border-t border-gray-800 py-6 mt-auto">
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <div class="flex items-center gap-1">
                    <a href="https://github.com/Fabio53443/cogestione" class="hover:text-gray-300 transition-colors">Open source</a>
                    <span>·</span>
                    <a href="https://github.com/Smartlinuxcoder" class="hover:text-gray-300 transition-colors">Smartlinux</a>
                    <span>+</span>
                    <a href="https://github.com/fabio53443" class="hover:text-gray-300 transition-colors">Fabio53443</a>
                </div>
                <a href="/admin" class="hover:text-gray-300 transition-colors">Admin</a>
            </div>
        </div>
    </footer>
</main>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap");

    :global(body) {
        font-family: "Inter", sans-serif;
        color: #213574;
        margin: 0;
        background: #1e1e2e;
    }
</style>
