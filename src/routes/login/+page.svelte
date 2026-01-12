<script>
    import Alert from "$lib/components/Alert.svelte";
    import Cookies from "js-cookie";
    let showAlert = false;
    let alertMessage = "";
    let alertType;

    const handleLogin = async (event) => {
        event.preventDefault();
        const username = event.target.elements.email.value;
        const password = event.target.elements.password.value;
        try {
            const response = await fetch("/api/studenti/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (result.success) {
                alertType = "success";
                alertMessage = "Login effettuato!";
                Cookies.set("token", result.token, {
                    expires: 7,
                    secure: true,
                    sameSite: "Strict",
                });
                window.location.href = "/studente/dashboard";
            } else {
                alertType = "error";
                alertMessage = result.message || "Login fallito.";
            }
        } catch (error) {
            alertType = "error";
            alertMessage = "Si è verificato un errore.";
        } finally {
            showAlert = true;
        }
    };
</script>

<Alert type={alertType} message={alertMessage} show={showAlert} />

<div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Bentornato</h1>
            <p class="text-gray-400">Accedi al tuo account</p>
        </div>
        
        <div class="bg-[#252536] rounded-2xl p-6 md:p-8 border border-gray-700/50">
            <form on:submit={handleLogin} class="space-y-5">
                <div>
                    <label class="block text-gray-300 text-sm font-medium mb-2" for="email">
                        Email
                    </label>
                    <input
                        class="w-full bg-[#1e1e2e] border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="email@esempio.com"
                        required
                    />
                </div>
                <div>
                    <label class="block text-gray-300 text-sm font-medium mb-2" for="password">
                        Password
                    </label>
                    <input
                        class="w-full bg-[#1e1e2e] border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB773C] focus:ring-1 focus:ring-[#FB773C] transition-colors"
                        id="password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button
                    class="w-full bg-[#FB773C] hover:bg-[#EB3678] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#FB773C]/20 mt-2"
                    type="submit"
                >
                    Accedi
                </button>
            </form>
        </div>
        
        <p class="text-center text-gray-400 text-sm mt-6">
            Non hai un account? <a href="/register" class="text-[#FB773C] hover:text-[#EB3678] font-medium">Registrati</a>
        </p>
    </div>
</div>
