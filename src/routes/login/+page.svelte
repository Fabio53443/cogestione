<script>
    import Alert from "$lib/components/Alert.svelte";
    import Cookies from "js-cookie";
    
    export let data;
    $: loginMethod = data.loginMethod;
    
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
    
    const handleGoogleLogin = () => {
        window.location.href = "/api/studenti/google";
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
            {#if loginMethod === 'google'}
                <div class="space-y-5">
                    <button
                        on:click={handleGoogleLogin}
                        class="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3"
                    >
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Accedi con Google
                    </button>
                </div>
            {:else}
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
            {/if}
        </div>
        
        {#if loginMethod !== 'google'}
            <p class="text-center text-gray-400 text-sm mt-6">
                Non hai un account? <a href="/register" class="text-[#FB773C] hover:text-[#EB3678] font-medium">Registrati</a>
            </p>
        {/if}
    </div>
</div>
