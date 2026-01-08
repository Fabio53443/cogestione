<script>
    import "../app.css";
    import { HomeOutline, UserOutline, ArrowLeftToBracketOutline, ArrowRightToBracketOutline  } from "flowbite-svelte-icons";
    export let data;
    const { siteConfig } = data;
</script>

<div class="max-w-2xl mx-auto text-center">
    <h1 class="text-4xl font-bold mb-6 text-[#FB773C]">
        Benvenuto alla {siteConfig.eventName} {siteConfig.schoolName ? `del ${siteConfig.schoolName}` : ''}
    </h1>
    <p class="text-xl mb-8 text-gray-300">
        {siteConfig.welcomeMessage}
        {#if siteConfig.socialLink && siteConfig.socialHandle}
            Segui <a class="text-[#fb773c]" href="{siteConfig.socialLink}"> {siteConfig.socialHandle}</a> per restare aggiornato!
        {/if}
        <br />Accedi qui:
    </p>


    <div class="space-x-4">
        <a href="/login" class="bg-[#FB773C] hover:bg-[#EB3678] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-200">
        Accedi </a>
    </div>
    {#if siteConfig.registrationDeadline}
    <div class="mt-8 text-3xl font-bold text-red-600">
        Il termine per registrarsi ai corsi o modificare le prenotazioni è il {new Date(siteConfig.registrationDeadline).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} alle {new Date(siteConfig.registrationDeadline).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}!
    </div>
    {/if}

    <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4 text-[#FB773C]">Come funziona?</h2>
    </div>

    <div class="space-y-4 text-left text-gray-300">
        <div>
            <h3 class="font-semibold mb-2">Registrazione</h3>
            <p>Crea un account o accedi per visualizzare e iscriverti ai corsi disponibili.</p>
        </div>

        <div>
            <h3 class="font-semibold mb-2">Iscrizione ai corsi</h3>
            <p>Sfoglia i corsi disponibili e iscriviti a quelli che ti interessano, selezionando giorno e ora.</p>
        </div>

        <div>
            <h3 class="font-semibold mb-2">Partecipazione</h3>
            <p>Presentati all'aula indicata all'orario previsto. I docenti registreranno la tua presenza.</p>
        </div>
    </div>


</div>