<script>
    import Alert from "$lib/components/Alert.svelte";

    export let data;

    let showAlert = false;
    let alertMessage = "";
    let alertType = "info";
    let loading = false;

    const handleSubmit = async (event) => {
        event.preventDefault();
        loading = true;

        const classe = event.target.elements.classe.value;

        if (!classe || classe.trim() === '') {
            alertType = "error";
            alertMessage = "Inserisci la tua classe.";
            showAlert = true;
            loading = false;
            return;
        }

        try {
            const response = await fetch("/api/studenti/update-classe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ classe }),
            });

            const result = await response.json();

            if (result.success) {
                alertType = "success";
                alertMessage = "Profilo completato!";
                showAlert = true;
                setTimeout(() => {
                    window.location.href = "/studente/dashboard";
                }, 1000);
            } else {
                alertType = "error";
                alertMessage = result.message || "Errore durante l'aggiornamento.";
                showAlert = true;
            }
        } catch (error) {
            alertType = "error";
            alertMessage = "Si è verificato un errore.";
            showAlert = true;
        } finally {
            loading = false;
        }
    };
</script>

<Alert type={alertType} message={alertMessage} show={showAlert} />

<div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Completa il profilo</h1>
            <p class="text-gray-400">Inserisci la tua classe per continuare</p>
        </div>
        
        <div class="bg-[#252536] rounded-2xl p-6 md:p-8 border border-gray-700/50">
            <form on:submit={handleSubmit} class="space-y-5">
                <div>
                    <label class="block text-gray-300 text-sm font-medium mb-2" for="classe">
                        Classe
                    </label>
                    <input
                        class="w-full bg-[#1e1e2e] border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                        id="classe"
                        type="text"
                        name="classe"
                        placeholder="Es. 5A"
                        required
                    />
                </div>
                <button
                    class="w-full bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#FB773C]/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Salvataggio...' : 'Continua'}
                </button>
            </form>
        </div>
    </div>
</div>
