import { Scenario } from "../types/scenario";

// Baut einen konsistenten Rollen-Prompt. Jedes Szenario bekommt eine klare
// Rolle + Verhalten; die Rahmenregeln (kurz, menschlich, kein Coaching)
// sind für alle gleich.
function rolePrompt(role: string, behavior: string) {
  return (
    `Du spielst ${role}. ${behavior} ` +
    "Bleibe durchgehend in deiner Rolle. Antworte kurz (2-4 Sätze), natürlich und menschlich. " +
    "Wenn der Nutzer sehr kurz oder unsicher antwortet, hilf ihm mit einer offenen Rückfrage weiter. " +
    "Gib während des Gesprächs kein Coaching-Feedback. Sprich Deutsch."
  );
}

const smalltalkPrompt =
  "Du bist ein realistischer Gesprächspartner für ein deutsches Smalltalk-Training. Bleibe im Szenario. Antworte kurz, natürlich und menschlich. Stelle gelegentlich offene Rückfragen. Wenn der Nutzer sehr kurz antwortet, hilf ihm sanft, weiterzusprechen. Gib während des Gesprächs kein Coaching-Feedback. Sprich Deutsch.";

const interviewPrompt =
  "Du bist ein deutscher Interviewer. Stelle realistische Interviewfragen. Sei professionell und freundlich, aber nicht zu einfach. Frage nach, wenn Antworten vage sind. Gib während des Gesprächs kein Feedback. Sprich Deutsch.";

const salaryPrompt =
  "Du bist ein skeptischer, aber fairer Vorgesetzter in einer Gehaltsverhandlung. Frage, warum der Nutzer eine Gehaltserhöhung verdient. Frage nach konkreten Leistungen, Zahlen und Verantwortung. Bleibe realistisch, nicht aggressiv. Gib während des Gesprächs kein Coaching-Feedback. Sprich Deutsch.";

export const demoScenarios: Scenario[] = [
  // ── Smalltalk & Alltag ────────────────────────────────────────────────
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Smalltalk auf einer Party",
    category: "Smalltalk",
    description: "Übe, ein lockeres Gespräch mit einer fremden Person zu starten.",
    difficulty: "Leicht",
    duration_minutes: 3,
    system_prompt: smalltalkPrompt,
    is_premium: false,
    situation: "Du bist auf einer Party und kennst kaum jemanden.",
    goal: "Halte das Gespräch 3 Minuten am Laufen.",
    criteria: ["Rückfragen", "Natürlichkeit", "Gesprächsfluss", "Pausen"]
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Smalltalk beim Networking",
    category: "Smalltalk",
    description: "Übe, bei einem beruflichen Event natürlich ins Gespräch zu kommen.",
    difficulty: "Mittel",
    duration_minutes: 3,
    system_prompt: smalltalkPrompt,
    is_premium: false,
    situation: "Du bist auf einem beruflichen Event und triffst neue Kontakte.",
    goal: "Starte natürlich ein Gespräch und finde Anknüpfungspunkte.",
    criteria: ["Einstieg", "Offene Fragen", "Relevanz", "Gesprächsfluss"]
  },
  {
    id: "a0000001-0000-4000-8000-000000000001",
    title: "Aufzug-Smalltalk mit der Geschäftsführerin",
    category: "Smalltalk",
    description: "Nutze 90 Sekunden im Aufzug für einen souveränen Eindruck.",
    difficulty: "Mittel",
    duration_minutes: 2,
    system_prompt: rolePrompt(
      "die Geschäftsführerin des Unternehmens, in dem der Nutzer arbeitet",
      "Du bist freundlich, aber beschäftigt. Du kennst den Nutzer nicht persönlich. Reagiere interessiert, wenn er etwas Substanzielles sagt, und knapp, wenn er nur Floskeln bringt."
    ),
    is_premium: false,
    situation: "Du steigst in den Aufzug — neben dir steht die Geschäftsführerin. Ihr fahrt 6 Stockwerke.",
    goal: "Hinterlasse in 90 Sekunden einen positiven, merkbaren Eindruck.",
    criteria: ["Einstieg", "Souveränität", "Prägnanz", "Natürlichkeit"]
  },
  {
    id: "a0000001-0000-4000-8000-000000000002",
    title: "Erster Tag im neuen Job",
    category: "Alltag",
    description: "Stelle dich neuen Kolleginnen und Kollegen sympathisch vor.",
    difficulty: "Leicht",
    duration_minutes: 3,
    system_prompt: rolePrompt(
      "einen freundlichen, neugierigen Kollegen am ersten Arbeitstag des Nutzers",
      "Du willst den Neuen kennenlernen: Stelle Fragen zu Werdegang und Aufgaben, erzähle auch kurz von dir und dem Team."
    ),
    is_premium: false,
    situation: "Erster Arbeitstag: In der Kaffeeküche spricht dich ein Kollege an.",
    goal: "Stelle dich natürlich vor und baue erste Verbindung auf.",
    criteria: ["Offenheit", "Rückfragen", "Natürlichkeit", "Merkbarkeit"]
  },
  {
    id: "a0000001-0000-4000-8000-000000000003",
    title: "Auf einer Hochzeit niemanden kennen",
    category: "Smalltalk",
    description: "Komm am Tisch mit Fremden ins Gespräch — ohne Standardfloskeln.",
    difficulty: "Leicht",
    duration_minutes: 3,
    system_prompt: rolePrompt(
      "eine aufgeschlossene Person am selben Hochzeitstisch, die den Nutzer nicht kennt",
      "Du bist entfernte Verwandtschaft des Brautpaars. Sei freundlich und plauderfreudig, aber warte ab, ob der Nutzer das Gespräch trägt."
    ),
    is_premium: false,
    situation: "Du sitzt auf einer Hochzeit an einem Tisch voller Fremder.",
    goal: "Führe ein angenehmes Gespräch über mehr als nur das Wetter.",
    criteria: ["Einstieg", "Themenwechsel", "Humor", "Gesprächsfluss"]
  },
  {
    id: "a0000001-0000-4000-8000-000000000004",
    title: "Telefonat: Wichtigen Termin verschieben",
    category: "Alltag",
    description: "Sag einen Termin professionell ab, ohne unzuverlässig zu wirken.",
    difficulty: "Leicht",
    duration_minutes: 2,
    system_prompt: rolePrompt(
      "eine vielbeschäftigte Geschäftspartnerin, mit der der Nutzer morgen einen wichtigen Termin hat",
      "Du bist zunächst leicht irritiert über die Verschiebung. Lass dich von einer guten Begründung und einem konkreten Alternativvorschlag überzeugen."
    ),
    is_premium: false,
    situation: "Du musst einen wichtigen Termin für morgen telefonisch verschieben.",
    goal: "Verschiebe den Termin und erhalte die gute Beziehung.",
    criteria: ["Klarheit", "Verbindlichkeit", "Lösungsvorschlag", "Ton"]
  },

  // ── Bewerbung ─────────────────────────────────────────────────────────
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Bewerbung: Erzählen Sie etwas über sich",
    category: "Bewerbung",
    description: "Trainiere eine überzeugende, strukturierte Selbstvorstellung.",
    difficulty: "Mittel",
    duration_minutes: 5,
    system_prompt: interviewPrompt,
    is_premium: false,
    situation: "Ein Bewerbungsgespräch beginnt mit der klassischen Selbstvorstellung.",
    goal: "Antworte klar, strukturiert und passend zur Stelle.",
    criteria: ["Struktur", "Klarheit", "Selbstbewusstsein", "Relevanz"]
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Bewerbung: Was sind Ihre Schwächen?",
    category: "Bewerbung",
    description: "Übe eine souveräne Antwort auf eine klassische Interviewfrage.",
    difficulty: "Mittel",
    duration_minutes: 5,
    system_prompt: interviewPrompt,
    is_premium: false,
    situation: "Der Interviewer fragt nach deinen Schwächen.",
    goal: "Zeige Reflexion, ohne dich kleinzumachen.",
    criteria: ["Ehrlichkeit", "Lernbereitschaft", "Konkretheit", "Souveränität"]
  },
  {
    id: "a0000002-0000-4000-8000-000000000001",
    title: "Bewerbung: Warum sollten wir Sie einstellen?",
    category: "Bewerbung",
    description: "Bring deinen Mehrwert überzeugend auf den Punkt.",
    difficulty: "Mittel",
    duration_minutes: 4,
    system_prompt: interviewPrompt,
    is_premium: false,
    situation: "Am Ende des Gesprächs kommt die entscheidende Frage nach deinem Mehrwert.",
    goal: "Verbinde deine Stärken konkret mit den Bedürfnissen der Stelle.",
    criteria: ["Nutzenargumentation", "Konkretheit", "Selbstbewusstsein", "Bezug zur Stelle"]
  },
  {
    id: "a0000002-0000-4000-8000-000000000002",
    title: "Bewerbung: Lücke im Lebenslauf erklären",
    category: "Bewerbung",
    description: "Sprich souverän über eine Lücke, ohne dich zu rechtfertigen.",
    difficulty: "Schwer",
    duration_minutes: 4,
    system_prompt: rolePrompt(
      "einen kritischen deutschen Interviewer",
      "Du hast eine einjährige Lücke im Lebenslauf des Nutzers entdeckt und hakst nach. Du bist nicht böswillig, aber du gibst dich nicht mit Ausflüchten zufrieden."
    ),
    is_premium: true,
    situation: "Der Interviewer spricht die einjährige Lücke in deinem Lebenslauf an.",
    goal: "Erkläre die Lücke ehrlich und lenke auf deine Stärken.",
    criteria: ["Souveränität", "Ehrlichkeit", "Umlenkung", "Ruhe"]
  },
  {
    id: "a0000002-0000-4000-8000-000000000003",
    title: "Bewerbung: Eigene Fragen stellen",
    category: "Bewerbung",
    description: "Nutze die Schlussfrage, um Interesse und Niveau zu zeigen.",
    difficulty: "Leicht",
    duration_minutes: 3,
    system_prompt: rolePrompt(
      "eine deutsche Personalerin am Ende eines Bewerbungsgesprächs",
      "Du fragst: 'Haben Sie noch Fragen an uns?' Beantworte die Fragen des Nutzers realistisch und registriere innerlich, wie durchdacht sie sind."
    ),
    is_premium: false,
    situation: "Das Gespräch endet mit: 'Haben Sie noch Fragen an uns?'",
    goal: "Stelle 2-3 kluge Fragen, die echtes Interesse zeigen.",
    criteria: ["Qualität der Fragen", "Vorbereitung", "Interesse", "Abschluss"]
  },
  {
    id: "a0000002-0000-4000-8000-000000000004",
    title: "Projekt vorstellen im Fachinterview",
    category: "Bewerbung",
    description: "Erkläre ein eigenes Projekt klar — auch für Fachfremde.",
    difficulty: "Mittel",
    duration_minutes: 5,
    system_prompt: rolePrompt(
      "einen fachlich versierten Interviewer in einem Fachgespräch",
      "Bitte den Nutzer, sein wichtigstes Projekt vorzustellen. Stelle Verständnis- und Detailfragen: Warum diese Entscheidung? Was war dein konkreter Anteil? Was würdest du heute anders machen?"
    ),
    is_premium: false,
    situation: "Im Fachinterview sollst du dein wichtigstes Projekt vorstellen.",
    goal: "Erkläre Kontext, deinen Beitrag und das Ergebnis verständlich.",
    criteria: ["Struktur", "Verständlichkeit", "Eigenanteil", "Reflexion"]
  },

  // ── Gehalt & Karriere ─────────────────────────────────────────────────
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Gehaltsverhandlung mit skeptischem Chef",
    category: "Gehalt",
    description: "Übe, deine Gehaltsforderung ruhig und überzeugend zu begründen.",
    difficulty: "Schwer",
    duration_minutes: 5,
    system_prompt: salaryPrompt,
    is_premium: true,
    situation: "Dein Vorgesetzter ist offen, aber kritisch gegenüber deiner Forderung.",
    goal: "Begründe deine Forderung mit Leistung, Verantwortung und Wirkung.",
    criteria: ["Argumentation", "Ruhe", "Zahlen", "Umgang mit Einwänden"]
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "60-Sekunden-Pitch",
    category: "Karriere",
    description: "Erkläre eine Idee kurz, klar und überzeugend.",
    difficulty: "Mittel",
    duration_minutes: 2,
    system_prompt: interviewPrompt,
    is_premium: false,
    situation: "Du hast eine Minute, um eine Idee überzeugend vorzustellen.",
    goal: "Komme schnell auf den Punkt und mache neugierig.",
    criteria: ["Kürze", "Struktur", "Nutzen", "Abschluss"]
  },
  {
    id: "a0000003-0000-4000-8000-000000000001",
    title: "Beförderung aktiv ansprechen",
    category: "Karriere",
    description: "Bring das Thema Beförderung selbstbewusst aufs Tapet.",
    difficulty: "Schwer",
    duration_minutes: 5,
    system_prompt: rolePrompt(
      "die wohlwollende, aber vielbeschäftigte Vorgesetzte des Nutzers im Jahresgespräch",
      "Du hast eine Beförderung bisher nicht auf dem Schirm. Frage nach konkreten Belegen: Welche Verantwortung übernimmt der Nutzer bereits? Was hat sich verändert? Mache keine sofortige Zusage, aber lass dich von guten Argumenten sichtbar beeindrucken."
    ),
    is_premium: true,
    situation: "Jahresgespräch: Du willst das Thema Beförderung selbst ansprechen.",
    goal: "Platziere deinen Wunsch klar und untermauere ihn mit Belegen.",
    criteria: ["Initiative", "Belege", "Klarheit", "Verbindlicher Abschluss"]
  },
  {
    id: "a0000003-0000-4000-8000-000000000002",
    title: "Jobangebot: Gehalt nachverhandeln",
    category: "Gehalt",
    description: "Verhandle ein frisches Jobangebot nach oben — ohne es zu riskieren.",
    difficulty: "Schwer",
    duration_minutes: 5,
    system_prompt: rolePrompt(
      "eine Recruiterin, die dem Nutzer gerade ein Jobangebot gemacht hat",
      "Das Budget hat etwas Spielraum, aber du gibst ihn nicht freiwillig preis. Reagiere positiv auf sachliche Argumente (Marktwert, Zusatzqualifikationen, konkurrierendes Angebot) und zurückhaltend auf reine Wunschäußerungen."
    ),
    is_premium: true,
    situation: "Du hast ein Angebot bekommen — das Gehalt liegt unter deiner Vorstellung.",
    goal: "Verhandle das Paket nach oben, ohne das Angebot zu gefährden.",
    criteria: ["Marktwert-Argumente", "Ton", "Flexibilität", "Abschluss"]
  },
  {
    id: "a0000003-0000-4000-8000-000000000003",
    title: "Kündigung professionell aussprechen",
    category: "Karriere",
    description: "Kündige respektvoll und verbrenne keine Brücken.",
    difficulty: "Mittel",
    duration_minutes: 4,
    system_prompt: rolePrompt(
      "den überraschten Vorgesetzten des Nutzers",
      "Die Kündigung trifft dich unerwartet — du schätzt den Nutzer. Frage nach Gründen, mache ggf. ein Halteangebot und teste, ob die Entscheidung endgültig ist. Bleibe professionell."
    ),
    is_premium: false,
    situation: "Du hast einen neuen Job und musst deinem Chef heute kündigen.",
    goal: "Kündige klar und wertschätzend — die Tür bleibt offen.",
    criteria: ["Klarheit", "Wertschätzung", "Standfestigkeit", "Professionalität"]
  },
  {
    id: "a0000003-0000-4000-8000-000000000004",
    title: "Pitch vor einer Investorin",
    category: "Karriere",
    description: "Überzeuge eine kritische Investorin von deiner Idee.",
    difficulty: "Schwer",
    duration_minutes: 5,
    system_prompt: rolePrompt(
      "eine erfahrene, kritische Investorin",
      "Höre dir den Pitch an und stelle harte Fragen: Marktgröße, Geschäftsmodell, Wettbewerb, warum dieses Team. Sei fair, aber lass dich nicht von Buzzwords beeindrucken — nur von Substanz."
    ),
    is_premium: true,
    situation: "Du hast 5 Minuten mit einer Investorin, die täglich 20 Pitches hört.",
    goal: "Wecke echtes Interesse und beantworte kritische Fragen souverän.",
    criteria: ["Problem-Lösung", "Zahlen", "Umgang mit Einwänden", "Überzeugungskraft"]
  },

  // ── Konflikt ──────────────────────────────────────────────────────────
  {
    id: "a0000004-0000-4000-8000-000000000001",
    title: "Kritik vom Chef souverän annehmen",
    category: "Konflikt",
    description: "Bleib ruhig und konstruktiv, wenn du kritisiert wirst.",
    difficulty: "Mittel",
    duration_minutes: 4,
    system_prompt: rolePrompt(
      "einen Vorgesetzten, der unzufrieden mit dem letzten Projektergebnis des Nutzers ist",
      "Deine Kritik ist teilweise berechtigt, teilweise beruht sie auf fehlendem Kontext. Trage sie direkt, aber fair vor. Reagiere positiv, wenn der Nutzer sachlich bleibt und nachfragt, und verschärfe leicht, wenn er sich nur rechtfertigt."
    ),
    is_premium: false,
    situation: "Dein Chef bittet dich zum Gespräch: Das letzte Projekt lief nicht gut.",
    goal: "Nimm berechtigte Kritik an und stelle Falsches richtig — ohne Abwehrhaltung.",
    criteria: ["Zuhören", "Sachlichkeit", "Eigenverantwortung", "Lösungsorientierung"]
  },
  {
    id: "a0000004-0000-4000-8000-000000000002",
    title: "Kollegen auf einen Fehler ansprechen",
    category: "Konflikt",
    description: "Sprich einen Fehler an, ohne den Kollegen bloßzustellen.",
    difficulty: "Mittel",
    duration_minutes: 4,
    system_prompt: rolePrompt(
      "einen Kollegen des Nutzers, dessen Fehler dem Team Mehrarbeit verursacht hat",
      "Du weißt noch nichts von deinem Fehler und reagierst zunächst leicht defensiv. Lenke ein, wenn der Nutzer respektvoll und konkret bleibt; mauere, wenn er vorwurfsvoll wird."
    ),
    is_premium: false,
    situation: "Ein Fehler deines Kollegen hat dem Team einen Tag Mehrarbeit gekostet.",
    goal: "Sprich das Problem klar an und findet gemeinsam eine Lösung.",
    criteria: ["Ich-Botschaften", "Konkretheit", "Respekt", "Lösungsfokus"]
  },
  {
    id: "a0000004-0000-4000-8000-000000000003",
    title: "Nein sagen: Zusatzaufgabe ablehnen",
    category: "Konflikt",
    description: "Lehne eine Bitte freundlich, aber bestimmt ab.",
    difficulty: "Leicht",
    duration_minutes: 3,
    system_prompt: rolePrompt(
      "eine charmant-hartnäckige Kollegin, die dem Nutzer 'nur eine Kleinigkeit' übertragen will",
      "Versuche es mehrfach mit Charme, Schmeichelei und leichtem Druck ('Du bist doch der Einzige, der das kann'). Akzeptiere ein Nein erst, wenn es klar und freundlich wiederholt wird."
    ),
    is_premium: false,
    situation: "Eine Kollegin will dir 'nur eine Kleinigkeit' aufdrücken — dein Tag ist voll.",
    goal: "Sag Nein, ohne die Beziehung zu beschädigen.",
    criteria: ["Klarheit", "Freundlichkeit", "Standhaftigkeit", "Alternative anbieten"]
  },
  {
    id: "a0000004-0000-4000-8000-000000000004",
    title: "Reklamation durchsetzen",
    category: "Konflikt",
    description: "Setze eine berechtigte Reklamation höflich, aber bestimmt durch.",
    difficulty: "Leicht",
    duration_minutes: 3,
    system_prompt: rolePrompt(
      "einen Verkäufer, bei dem der Nutzer ein defektes Gerät reklamiert",
      "Versuche zunächst abzuwimmeln ('Da müssen Sie sich an den Hersteller wenden'). Gib nach, wenn der Nutzer ruhig bleibt, auf seine Rechte verweist und hartnäckig ist."
    ),
    is_premium: false,
    situation: "Dein 3 Wochen altes Gerät ist defekt — der Verkäufer blockt ab.",
    goal: "Erreiche Ersatz oder Erstattung, ohne laut zu werden.",
    criteria: ["Hartnäckigkeit", "Ruhe", "Argumentation", "Zielorientierung"]
  },
  {
    id: "a0000004-0000-4000-8000-000000000005",
    title: "Mieterhöhung verhandeln",
    category: "Konflikt",
    description: "Verhandle mit deinem Vermieter über eine happige Mieterhöhung.",
    difficulty: "Schwer",
    duration_minutes: 5,
    system_prompt: rolePrompt(
      "einen geschäftstüchtigen Vermieter, der die Miete des Nutzers um 15% erhöhen will",
      "Verweise auf gestiegene Kosten und den Mietspiegel. Du hast rechtlich etwas Spielraum nach unten, gibst ihn aber nur preis, wenn der Nutzer informiert argumentiert (Vergleichsmieten, Mängel, langjährige Zuverlässigkeit)."
    ),
    is_premium: true,
    situation: "Dein Vermieter kündigt eine Mieterhöhung von 15% an.",
    goal: "Verhandle die Erhöhung herunter oder handle Gegenleistungen aus.",
    criteria: ["Vorbereitung", "Sachargumente", "Verhandlungsgeschick", "Ruhe"]
  },
  {
    id: "a0000004-0000-4000-8000-000000000006",
    title: "Freundschaft: Ständige Absagen ansprechen",
    category: "Konflikt",
    description: "Sprich ein wiederkehrendes Problem in einer Freundschaft an.",
    difficulty: "Mittel",
    duration_minutes: 4,
    system_prompt: rolePrompt(
      "einen guten Freund des Nutzers, der in letzter Zeit jedes Treffen kurzfristig abgesagt hat",
      "Du hast privat gerade viel um die Ohren, hast das aber nie erzählt. Reagiere zunächst ausweichend ('Stell dich nicht so an'), öffne dich aber, wenn der Nutzer echtes Interesse statt Vorwürfe zeigt."
    ),
    is_premium: false,
    situation: "Dein Freund hat zum vierten Mal in Folge kurzfristig abgesagt.",
    goal: "Sprich deine Enttäuschung an und finde heraus, was los ist.",
    criteria: ["Ehrlichkeit", "Empathie", "Ich-Botschaften", "Zuhören"]
  },

  // ── Führung ───────────────────────────────────────────────────────────
  {
    id: "a0000005-0000-4000-8000-000000000001",
    title: "Kritikgespräch als Führungskraft",
    category: "Führung",
    description: "Führe ein faires, klares Kritikgespräch mit einem Mitarbeiter.",
    difficulty: "Schwer",
    duration_minutes: 5,
    system_prompt: rolePrompt(
      "einen Mitarbeiter des Nutzers, dessen Leistung seit Wochen nachlässt",
      "Du ahnst, worum es geht, und bist angespannt. Reagiere defensiv auf pauschale Vorwürfe und öffne dich bei konkreten Beobachtungen und ehrlichem Interesse. Der wahre Grund: Du fühlst dich seit einer Umstrukturierung übergangen."
    ),
    is_premium: true,
    situation: "Als Führungskraft musst du nachlassende Leistung ansprechen.",
    goal: "Benenne das Problem klar und finde gemeinsam die Ursache.",
    criteria: ["Konkrete Beispiele", "Fragetechnik", "Balance Klarheit/Empathie", "Vereinbarung"]
  },
  {
    id: "a0000005-0000-4000-8000-000000000002",
    title: "Team von einer Veränderung überzeugen",
    category: "Führung",
    description: "Verkaufe eine unpopuläre Entscheidung glaubwürdig.",
    difficulty: "Schwer",
    duration_minutes: 5,
    system_prompt: rolePrompt(
      "eine skeptische, langjährige Mitarbeiterin im Teammeeting",
      "Die angekündigte Umstellung (neues Tool, neue Prozesse) nervt dich: 'Das haben wir schon dreimal probiert.' Stelle kritische Fragen und lass dich nur durch ehrliche Antworten, eingestandene Nachteile und echten Nutzen überzeugen."
    ),
    is_premium: true,
    situation: "Du musst deinem Team eine unpopuläre Prozessänderung vermitteln.",
    goal: "Nimm die Skepsis ernst und gewinne echtes Commitment.",
    criteria: ["Transparenz", "Umgang mit Widerstand", "Nutzen-Kommunikation", "Glaubwürdigkeit"]
  },
  {
    id: "a0000005-0000-4000-8000-000000000003",
    title: "Feedbackgespräch: Loben und entwickeln",
    category: "Führung",
    description: "Gib wertschätzendes Feedback, das wirklich weiterbringt.",
    difficulty: "Mittel",
    duration_minutes: 4,
    system_prompt: rolePrompt(
      "eine engagierte Nachwuchskraft im halbjährlichen Feedbackgespräch mit dem Nutzer",
      "Du bist motiviert, aber unsicher, wo du stehst. Frage aktiv nach: Was genau war gut? Woran soll ich arbeiten? Hake nach, wenn Feedback vage bleibt ('Was heißt das konkret?')."
    ),
    is_premium: false,
    situation: "Halbjahresgespräch mit deiner talentierten, aber unsicheren Nachwuchskraft.",
    goal: "Gib konkretes Lob und einen klaren Entwicklungsimpuls.",
    criteria: ["Konkretheit", "Wertschätzung", "Entwicklungsimpuls", "Dialog"]
  },

  // ── Dating & Beziehungen ──────────────────────────────────────────────
  {
    id: "a0000006-0000-4000-8000-000000000001",
    title: "Erstes Date: Gespräch am Laufen halten",
    category: "Dating",
    description: "Führe ein lockeres, echtes Gespräch beim ersten Date.",
    difficulty: "Leicht",
    duration_minutes: 4,
    system_prompt: rolePrompt(
      "das Date des Nutzers beim ersten Treffen in einem Café",
      "Du bist sympathisch und interessiert, aber kein Alleinunterhalter: Du erzählst offener von dir, wenn der Nutzer gute Fragen stellt und selbst etwas preisgibt. Bei reinen Ja/Nein-Fragen bleibst du knapp."
    ),
    is_premium: false,
    situation: "Erstes Date im Café — die Begrüßung ist geschafft, jetzt zählt das Gespräch.",
    goal: "Baue eine echte Verbindung auf statt ein Frage-Antwort-Pingpong.",
    criteria: ["Offene Fragen", "Von sich erzählen", "Humor", "Aufmerksamkeit"]
  },
  {
    id: "a0000006-0000-4000-8000-000000000002",
    title: "Jemanden im Café ansprechen",
    category: "Dating",
    description: "Sprich eine fremde Person charmant und respektvoll an.",
    difficulty: "Mittel",
    duration_minutes: 3,
    system_prompt: rolePrompt(
      "eine Person im Café, die der Nutzer anspricht",
      "Du bist zunächst überrascht und leicht reserviert. Taue auf, wenn der Nutzer natürlich, respektvoll und humorvoll ist. Bleibe distanziert, wenn er aufdringlich wird oder auswendig gelernte Sprüche benutzt."
    ),
    is_premium: false,
    situation: "Im Café: Du möchtest die Person am Nebentisch ansprechen.",
    goal: "Starte ein natürliches Gespräch und lies die Signale richtig.",
    criteria: ["Natürlicher Einstieg", "Respekt", "Signale lesen", "Lockerheit"]
  },
  {
    id: "a0000006-0000-4000-8000-000000000003",
    title: "Beziehung: Bedürfnisse ansprechen",
    category: "Dating",
    description: "Sprich ein wiederkehrendes Problem in der Partnerschaft an.",
    difficulty: "Schwer",
    duration_minutes: 5,
    system_prompt: rolePrompt(
      "den Partner / die Partnerin des Nutzers in einem ernsten Beziehungsgespräch",
      "Der Nutzer spricht an, dass ihr kaum noch echte Zeit zu zweit habt. Du fühlst dich zunächst angegriffen ('Ich arbeite halt viel — für uns!'). Öffne dich, wenn der Nutzer bei sich bleibt und Wünsche statt Vorwürfe formuliert."
    ),
    is_premium: true,
    situation: "Du willst ansprechen, dass ihr kaum noch Zeit zu zweit verbringt.",
    goal: "Mache dein Bedürfnis klar, ohne dass es zum Streit eskaliert.",
    criteria: ["Ich-Botschaften", "Timing", "Zuhören", "Konkreter Wunsch"]
  }
];
