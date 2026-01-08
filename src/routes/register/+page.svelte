<script>
    import Alert from "$lib/components/Alert.svelte";

    let showAlert = false;
    let alertMessage = "";
    let alertType = "info";

    const handleRegister = async (event) => {
        event.preventDefault();

        const nome = event.target.elements.nome.value;
        const email = event.target.elements.email.value;
        const password = event.target.elements.password.value;

        try {
            const response = await fetch("/api/studenti/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome,
                    email,
                    password,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alertType = "success";
                alertMessage = "Registrazione completata! Ora puoi accedere.";
                showAlert = true;
                // Redirect to login after a short delay
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            } else {
                alertType = "error";
                alertMessage = result.message || "Registrazione fallita.";
                showAlert = true;
            }
        } catch (error) {
            alertType = "error";
            alertMessage = "Si è verificato un errore.";
            showAlert = true;
        }
    };
</script>

<!-- Use the alert component -->
<Alert type={alertType} message={alertMessage} show={showAlert} />

<div
    class="container mx-auto flex flex-col items-center justify-start pt-16 px-4"
>
    <h1 class="text-3xl font-bold text-center text-[#FB773C] mb-8">
        Registrati
    </h1>
    <div class="w-full max-w-md">
        <form
            on:submit={handleRegister}
            class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
        >
        <div class="mb-4">
                
            <label
                class="block text-gray-700 text-sm font-bold mb-2"
                for="nome"
            >
                Nome completo
            </label>
            <input
                class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
                id="nome"
                type="text"
                name="nome"
                placeholder="Nome e cognome"
                required
            />
        </div>
    <div class="mb-4">
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="email"
                >
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
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="password"
                >
                    Password
                </label>
                <input
                    class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-[#EB3678]"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="******************"
                    required
                />
            </div>
            <div class="flex items-center justify-between">
                <button
                    class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-200"
                    type="submit"
                >
                    Registrati
                </button>
            </div>
        </form>
        <p class="text-center text-gray-300 text-sm">
            Hai già un account? <a href="/login" class="text-[#EB3678] hover:underline">Accedi</a>
        </p>
    </div>
</div>
