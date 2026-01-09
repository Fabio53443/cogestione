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
            <a href="/register" class="border border-gray-600 hover:border-[#FB773C] text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200">
                Registrati
            </a>
        </div>

        <a href="/docenti/login" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors mb-6">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Sei un docente? Accedi qui
        </a>

        {#if siteConfig.socialLink && siteConfig.socialHandle}
            <a href="{siteConfig.socialLink}" class="inline-flex items-center gap-2 text-gray-400 hover:text-[#FB773C] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
                {siteConfig.socialHandle}
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