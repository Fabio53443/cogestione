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

<div
    class="container mx-auto flex flex-col items-center justify-start pt-16 px-4"
>
    <h1 class="text-3xl font-bold text-center text-[#FB773C] mb-8">Accedi</h1>
    <div class="w-full max-w-md bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <form on:submit={handleLogin}>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                    Email
                </label>
                <input
                    class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="La tua email"
                    required
                />
            </div>
            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                    Password
                </label>
                <input
                    class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="La tua password"
                    required
                />
            </div>
            <div class="flex items-center justify-between">
                <button
                    class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Accedi
                </button>
            </div>
        </form>
        <p class="text-center text-gray-600 text-sm mt-4">
            Non hai un account? <a href="/register" class="text-[#EB3678] hover:underline">Registrati</a>
        </p>
    </div>
</div>
