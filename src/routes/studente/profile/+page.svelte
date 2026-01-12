<script>
  export let data;
  const { user, nomeCompleto, email } = data;
</script>

<div class="max-w-md mx-auto px-4">
  <h1 class="text-2xl md:text-3xl font-bold text-white mb-8">Profilo</h1>
  
  <div class="bg-[#252536] rounded-2xl p-6 border border-gray-700/50">
    <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700/50">
      <div class="w-16 h-16 bg-[#FB773C]/20 rounded-full flex items-center justify-center">
        <span class="text-2xl font-bold text-[#FB773C]">{nomeCompleto.charAt(0).toUpperCase()}</span>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-white">{nomeCompleto}</h2>
        <p class="text-gray-400 text-sm">Studente</p>
      </div>
    </div>
    
    <div class="space-y-4">
      <div>
        <span class="block text-gray-500 text-xs uppercase tracking-wide mb-1">Email</span>
        <p class="text-white">{email}</p>
      </div>
    </div>
  </div>
  
  <div class="mt-6 flex gap-3">
    <a href="/studente/dashboard" class="flex-1 bg-[#FB773C] hover:bg-[#EB3678] text-white text-center font-semibold py-3 px-4 rounded-xl transition-all duration-200">
      I miei corsi
    </a>
    <a href="/logout" class="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-center font-semibold py-3 px-4 rounded-xl border border-gray-700 transition-all duration-200">
      Esci
    </a>
  </div>
</div>