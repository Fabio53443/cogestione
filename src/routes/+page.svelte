<script>
    import "../app.css";
    export let data;
    const { siteConfig } = data;
</script>

<div class="max-w-3xl mx-auto px-4">
    <!-- Hero Section -->
    <div class="text-center py-8 md:py-12">
        <h1 class="text-3xl md:text-5xl font-bold mb-4 text-white leading-tight">
            {siteConfig.eventName}
        </h1>
        {#if siteConfig.schoolName}
            <p class="text-lg md:text-xl text-gray-400 mb-6">{siteConfig.schoolName}</p>
        {/if}
        
        {#if siteConfig.welcomeMessage}
            <p class="text-gray-300 mb-8 max-w-xl mx-auto">{siteConfig.welcomeMessage}</p>
        {/if}

        <div class="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="/login" class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#FB773C]/20">
                Accedi
            </a>
                    <a href="/docenti/login" class="border border-gray-600 hover:border-[#FB773C] text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200">
            Tieni un corso? Accedi qui
        </a>

        </div>


        {#if siteConfig.socialLink && siteConfig.socialHandle}
            <br><a href="{siteConfig.socialLink}" class="inline-flex items-center gap-2 text-gray-400 hover:text-[#FB773C] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram-icon lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>                {siteConfig.socialHandle}
            </a>
        {/if}
    </div>

    {#if siteConfig.registrationDeadline}
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-center">
            <p class="text-red-400 font-medium">
                ⏰ Scadenza iscrizioni: {new Date(siteConfig.registrationDeadline).toLocaleDateString('it-IT', { day: '2-digit', month: 'long' })} alle {new Date(siteConfig.registrationDeadline).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    {/if}

    <!-- Steps -->
    <div class="grid md:grid-cols-3 gap-4 md:gap-6">
        <div class="bg-[#252536] rounded-xl p-5 border border-gray-700/50">
            <div class="w-10 h-10 bg-[#FB773C]/20 rounded-lg flex items-center justify-center mb-3">
                <span class="text-[#FB773C] font-bold">1</span>
            </div>
            <h3 class="text-white font-semibold mb-2">Registrati</h3>
            <p class="text-gray-400 text-sm">Crea il tuo account per accedere ai corsi.</p>
        </div>
        <div class="bg-[#252536] rounded-xl p-5 border border-gray-700/50">
            <div class="w-10 h-10 bg-[#FB773C]/20 rounded-lg flex items-center justify-center mb-3">
                <span class="text-[#FB773C] font-bold">2</span>
            </div>
            <h3 class="text-white font-semibold mb-2">Scegli i corsi</h3>
            <p class="text-gray-400 text-sm">Sfoglia e iscriviti ai corsi che preferisci.</p>
        </div>
        <div class="bg-[#252536] rounded-xl p-5 border border-gray-700/50">
            <div class="w-10 h-10 bg-[#FB773C]/20 rounded-lg flex items-center justify-center mb-3">
                <span class="text-[#FB773C] font-bold">3</span>
            </div>
            <h3 class="text-white font-semibold mb-2">Partecipa</h3>
            <p class="text-gray-400 text-sm">Presentati all'aula all'orario indicato.</p>
        </div>
    </div>
</div>