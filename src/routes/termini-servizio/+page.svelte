<script>
    export let data;
    const schoolName = data.siteConfig?.schoolName || "La mia Scuola";
</script>

<svelte:head>
    <title>Termini di Servizio - {schoolName}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-8">
        <a
            href="/"
            class="text-[#FB773C] hover:text-[#EB3678] transition-colors"
            >← Torna alla home</a
        >
    </div>

    <div class="bg-white shadow-lg rounded-lg p-8">
        <h1 class="text-4xl font-bold text-[#FB773C] mb-6">
            Termini di Servizio
        </h1>

        <div class="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p class="text-sm text-gray-500">
                Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
            </p>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    1. Informazioni sul Servizio
                </h2>
                <p>
                    Questo sito web è gestito dai <strong
                        >rappresentanti d'istituto</strong
                    >
                    di <strong>{schoolName}</strong>
                    per facilitare la gestione e l'iscrizione ai corsi durante il
                    periodo di autogestione/cogestione.
                </p>
                <p>
                    Il servizio è fornito "così com'è" e viene mantenuto su base
                    volontaria dagli studenti rappresentanti.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    2. Accesso e Registrazione
                </h2>
                <p>
                    Per accedere al servizio, è necessario effettuare il login
                    utilizzando uno dei seguenti metodi:
                </p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>Account Google (tramite Google OAuth)</li>
                    <li>Credenziali create in autonomia</li>
                </ul>
                <p>
                    <strong>Autenticazione Google:</strong> Quando utilizzi il
                    login con Google, accetti anche i
                    <a
                        href="https://policies.google.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-[#FB773C] hover:text-[#EB3678] underline"
                    >
                        Termini di Servizio di Google
                    </a>
                    e la
                    <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-[#FB773C] hover:text-[#EB3678] underline"
                    >
                        Privacy Policy di Google
                    </a>.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    3. Responsabilità dell'Utente
                </h2>
                <p>Utilizzando questo servizio, ti impegni a:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        Fornire informazioni accurate e veritiere durante la
                        registrazione
                    </li>
                    <li>Mantenere riservate le tue credenziali di accesso</li>
                    <li>Non condividere il tuo account con altri utenti</li>
                    <li>
                        Utilizzare il servizio solo per scopi legittimi legati
                        all'attività scolastica
                    </li>
                    <li>
                        Non tentare di accedere ad aree riservate o dati di
                        altri utenti
                    </li>
                    <li>Rispettare le scadenze per le iscrizioni ai corsi</li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    4. Utilizzo dei Dati
                </h2>
                <p>
                    I dati raccolti attraverso questo servizio vengono
                    utilizzati esclusivamente per:
                </p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>Gestire le iscrizioni ai corsi</li>
                    <li>Monitorare le presenze</li>
                    <li>Comunicare informazioni relative ai corsi</li>
                    <li>Generare statistiche aggregate anonime</li>
                </ul>
                <p>
                    Per maggiori dettagli sul trattamento dei dati personali,
                    consulta la nostra
                    <a
                        href="/privacy"
                        class="text-[#FB773C] hover:text-[#EB3678] underline"
                        >Privacy Policy</a
                    >.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    5. Disponibilità del Servizio
                </h2>
                <p>
                    Ci impegniamo a mantenere il servizio disponibile e
                    funzionante, tuttavia:
                </p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        Il servizio potrebbe essere temporaneamente non
                        disponibile per manutenzione o aggiornamenti
                    </li>
                    <li>Non garantiamo un uptime del 100%</li>
                    <li>Potrebbero verificarsi interruzioni non pianificate</li>
                    <li>
                        Il servizio è fornito su base volontaria senza garanzie
                        di continuità
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    6. Limitazioni di Responsabilità
                </h2>
                <p>
                    I rappresentanti d'istituto e {schoolName} non sono responsabili
                    per:
                </p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>Perdita di dati dovuta a malfunzionamenti tecnici</li>
                    <li>
                        Impossibilità di iscriversi ai corsi a causa di problemi
                        tecnici
                    </li>
                    <li>Errori o imprecisioni nelle informazioni fornite</li>
                    <li>
                        Danni diretti o indiretti derivanti dall'uso del
                        servizio
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    7. Modifiche ai Termini
                </h2>
                <p>
                    Ci riserviamo il diritto di modificare questi termini in
                    qualsiasi momento. Le modifiche saranno effettive
                    immediatamente dopo la pubblicazione sul sito. L'uso
                    continuato del servizio dopo le modifiche costituisce
                    accettazione dei nuovi termini.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    8. Contatti
                </h2>
                <p>
                    Per domande o chiarimenti riguardo questi termini di
                    servizio, contatta i rappresentanti d'istituto di {schoolName}.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    9. Legge Applicabile
                </h2>
                <p>
                    Questi termini sono regolati dalla legge italiana. Qualsiasi
                    controversia sarà soggetta alla giurisdizione esclusiva dei
                    tribunali italiani.
                </p>
            </section>
        </div>
    </div>
</div>

<style>
    .prose a {
        word-wrap: break-word;
    }
</style>
