<script>
    export let data;
    const schoolName = data.siteConfig?.schoolName || "La mia Scuola";
</script>

<svelte:head>
    <title>Privacy Policy - {schoolName}</title>
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
        <h1 class="text-4xl font-bold text-[#FB773C] mb-6">Privacy Policy</h1>

        <div class="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p class="text-sm text-gray-500">
                Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
            </p>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    1. Introduzione
                </h2>
                <p>
                    Questa Privacy Policy descrive come i <strong
                        >rappresentanti d'istituto</strong
                    >
                    di <strong>{schoolName}</strong>
                    raccolgono, utilizzano e proteggono i tuoi dati personali attraverso
                    questo sito web.
                </p>
                <p>
                    Ci impegniamo a proteggere la tua privacy e a trattare i
                    tuoi dati in conformità con il Regolamento Generale sulla
                    Protezione dei Dati (GDPR) e le normative italiane sulla
                    privacy.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    2. Titolare del Trattamento
                </h2>
                <p>
                    I titolari del trattamento dei dati sono i rappresentanti d'istituto di <strong
                        >{schoolName}</strong>
                        
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    3. Dati Raccolti
                </h2>
                <p>Raccogliamo le seguenti categorie di dati personali:</p>

                <h3 class="text-xl font-semibold text-gray-700 mt-6 mb-3">
                    3.1 Dati forniti direttamente
                </h3>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Nome completo</strong> - per identificarti all'interno
                        del sistema
                    </li>
                    <li>
                        <strong>Indirizzo email</strong> - per l'autenticazione e
                        le comunicazioni
                    </li>
                    <li>
                        <strong>Classe</strong> - per organizzare i corsi e le iscrizioni
                    </li>
                    <li>
                        <strong>Password (hash)</strong> - per proteggere il tuo
                        account (se non usi Google OAuth)
                    </li>
                </ul>

                <h3 class="text-xl font-semibold text-gray-700 mt-6 mb-3">
                    3.2 Dati raccolti tramite Google OAuth
                </h3>
                <p>Se scegli di accedere tramite Google, raccogliamo:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Google ID</strong> - identificativo univoco del tuo
                        account Google
                    </li>
                    <li><strong>Nome</strong> - dal tuo profilo Google</li>
                    <li><strong>Email</strong> - dal tuo account Google</li>
                </ul>
                <p>
                    <strong>Importante:</strong> Quando utilizzi il login con
                    Google, i tuoi dati vengono gestiti anche secondo la
                    <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-[#FB773C] hover:text-[#EB3678] underline"
                    >
                        Privacy Policy di Google
                    </a>. Google potrebbe raccogliere dati aggiuntivi secondo le
                    proprie politiche.
                </p>

                <h3 class="text-xl font-semibold text-gray-700 mt-6 mb-3">
                    3.3 Dati di utilizzo
                </h3>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Iscrizioni ai corsi</strong> - quali corsi hai scelto
                    </li>
                    <li>
                        <strong>Presenze</strong> - registrazione della tua partecipazione
                        ai corsi
                    </li>
                    <li>
                        <strong>Data e ora di accesso</strong> - per motivi di sicurezza
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    4. Finalità del Trattamento
                </h2>
                <p>I tuoi dati personali vengono utilizzati per:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Gestione dell'account</strong> - creare e mantenere
                        il tuo profilo utente
                    </li>
                    <li>
                        <strong>Iscrizione ai corsi</strong> - permetterti di iscriverti
                        e gestire le tue iscrizioni
                    </li>
                    <li>
                        <strong>Monitoraggio presenze</strong> - registrare la tua
                        partecipazione ai corsi
                    </li>
                    <li>
                        <strong>Comunicazioni</strong> - inviarti notifiche relative
                        ai corsi e al servizio
                    </li>
                    <li>
                        <strong>Statistiche</strong> - generare report aggregati
                        e anonimi sull'utilizzo del servizio
                    </li>
                    <li>
                        <strong>Sicurezza</strong> - prevenire accessi non autorizzati
                        e abusi del sistema
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    5. Base Giuridica del Trattamento
                </h2>
                <p>Il trattamento dei tuoi dati si basa su:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Consenso</strong> - fornito al momento della registrazione
                    </li>
                    <li>
                        <strong>Esecuzione di un servizio</strong> - necessario per
                        fornirti il servizio di gestione corsi
                    </li>
                    <li>
                        <strong>Interesse legittimo</strong> - per migliorare il
                        servizio e garantirne la sicurezza
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    6. Conservazione dei Dati
                </h2>
                <p>I tuoi dati personali vengono conservati per:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Dati dell'account</strong> - fino alla cancellazione
                        dell'account o alla fine dell'anno scolastico
                    </li>
                    <li>
                        <strong>Dati delle iscrizioni</strong> - per l'anno scolastico
                        corrente e quello successivo per scopi statistici
                    </li>
                    <li><strong>Log di accesso</strong> - massimo 90 giorni</li>
                </ul>
                <p>
                    Dopo questi periodi, i dati vengono cancellati o
                    anonimizzati in modo irreversibile.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    7. Condivisione dei Dati
                </h2>
                <p>
                    I tuoi dati personali <strong>non vengono venduti</strong> a
                    terze parti. Possono essere condivisi solo con:
                </p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Docenti</strong> - possono vedere i nomi degli studenti
                        iscritti ai loro corsi
                    </li>
                    <li>
                        <strong>Amministratori del sistema</strong> - i rappresentanti
                        d'istituto per la gestione tecnica
                    </li>
                    <li>
                        <strong>Google</strong> - se utilizzi l'autenticazione Google
                        OAuth (secondo la loro Privacy Policy)
                    </li>
                    <li>
                        <strong>Fornitori di servizi tecnici</strong> - per l'hosting
                        e la manutenzione del database (con accordi di riservatezza)
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    8. Sicurezza dei Dati
                </h2>
                <p>
                    Adottiamo misure di sicurezza appropriate per proteggere i
                    tuoi dati:
                </p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Crittografia</strong> - le password sono salvate
                        in formato hash crittografico
                    </li>
                    <li>
                        <strong>HTTPS</strong> - tutte le comunicazioni sono crittografate
                        tramite SSL/TLS
                    </li>
                    <li>
                        <strong>Accesso limitato</strong> - solo gli amministratori
                        autorizzati possono accedere ai dati
                    </li>
                    <li>
                        <strong>Backup regolari</strong> - per prevenire la perdita
                        di dati
                    </li>
                </ul>
                <p>
                    Tuttavia, nessun sistema è completamente sicuro. Ci
                    impegniamo a fare del nostro meglio, ma non possiamo
                    garantire la sicurezza assoluta.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    9. I Tuoi Diritti
                </h2>
                <p>In conformità con il GDPR, hai i seguenti diritti:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Diritto di accesso</strong> - puoi richiedere una
                        copia dei tuoi dati personali
                    </li>
                    <li>
                        <strong>Diritto di rettifica</strong> - puoi correggere dati
                        inesatti o incompleti
                    </li>
                    <li>
                        <strong>Diritto alla cancellazione</strong> - puoi richiedere
                        la cancellazione dei tuoi dati
                    </li>
                    <li>
                        <strong>Diritto di limitazione</strong> - puoi richiedere
                        la limitazione del trattamento
                    </li>
                    <li>
                        <strong>Diritto di portabilità</strong> - puoi richiedere
                        i tuoi dati in formato leggibile
                    </li>
                    <li>
                        <strong>Diritto di opposizione</strong> - puoi opporti a
                        determinati trattamenti
                    </li>
                    <li>
                        <strong>Diritto di revoca del consenso</strong> - puoi revocare
                        il consenso in qualsiasi momento
                    </li>
                </ul>
                <p>
                    Per esercitare questi diritti, contatta i rappresentanti
                    d'istituto di {schoolName}.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    10. Cookie e Tecnologie Simili
                </h2>
                <p>Il sito utilizza cookie tecnici essenziali per:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Autenticazione</strong> - mantenere la tua sessione
                        di login attiva
                    </li>
                    <li>
                        <strong>Sicurezza</strong> - proteggere contro attacchi CSRF
                    </li>
                </ul>
                <p>
                    Non utilizziamo cookie di profilazione o tracciamento per
                    scopi pubblicitari.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    11. Minori
                </h2>
                <p>
                    Questo servizio è destinato principalmente a studenti di
                    scuola superiore. Se hai meno di 14 anni, è necessario il
                    consenso dei tuoi genitori o tutori legali per utilizzare il
                    servizio.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    12. Modifiche alla Privacy Policy
                </h2>
                <p>
                    Ci riserviamo il diritto di aggiornare questa Privacy Policy
                    in qualsiasi momento. Le modifiche saranno pubblicate su
                    questa pagina con una nuova data di aggiornamento. Ti
                    consigliamo di consultare periodicamente questa pagina per
                    rimanere informato.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                    13. Contatti
                </h2>
                <p>
                    Per domande, richieste o reclami riguardo questa Privacy
                    Policy o il trattamento dei tuoi dati personali, contatta i
                    rappresentanti d'istituto di {schoolName}.
                </p>
                <p>
                    Hai anche il diritto di presentare un reclamo al Garante per
                    la Protezione dei Dati Personali se ritieni che il
                    trattamento dei tuoi dati violi la normativa sulla privacy.
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
