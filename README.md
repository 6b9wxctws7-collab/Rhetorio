# RhetoCoach

RhetoCoach ist eine App zum **Üben von Gesprächen mit einer KI** – auf Deutsch.
Man wählt ein Szenario, führt ein Rollenspiel per Text (oder Stimme im Browser),
und bekommt danach eine Auswertung. Läuft als Handy-App (iOS/Android) und als
Web-App im Browser.

**Technik dahinter:** Expo / React Native (App), Supabase (Login + Datenbank),
OpenAI (die KI-Antworten). Vercel hostet die Web-Version.

---

## Was du brauchst, um die App selbst zu betreiben

Du brauchst drei eigene, kostenlose/kostenpflichtige Konten:

1. **Supabase** – Login & Datenbank ([supabase.com](https://supabase.com))
2. **OpenAI** – für die KI-Antworten ([platform.openai.com](https://platform.openai.com)) – hier fällt Nutzung nach Verbrauch an
3. **Vercel** – um die Web-Version online zu stellen ([vercel.com](https://vercel.com)) – optional

> Die Werte unten (`https://dein-projekt.supabase.co`, `dein-anon-key`, `sk-...`)
> sind **Platzhalter**. Du ersetzt sie durch deine eigenen aus den jeweiligen Dashboards.

---

## Schritt 1: Supabase einrichten

1. Neues Projekt auf [supabase.com](https://supabase.com) anlegen.
2. Unter **Project Settings → API** findest du zwei Werte:
   - `Project URL`
   - `anon public` Key
3. Diese kommen gleich in die `.env`-Datei (Schritt 2).

**Datenbank aufsetzen und KI-Funktionen ("Edge Functions") hochladen:**

```bash
# Datenbank-Struktur anlegen
supabase db push

# Geheime Schlüssel für die Server-Funktionen hinterlegen
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set OPENAI_MODEL=gpt-4o-mini
supabase secrets set OPENAI_REALTIME_MODEL=gpt-realtime
supabase secrets set OPENAI_REALTIME_VOICE=marin

# Funktionen hochladen
supabase functions deploy generate-reply
supabase functions deploy analyze-session
supabase functions deploy create-realtime-session
supabase functions deploy record-voice-usage
```

**Login-Weiterleitungen** (damit E-Mail-Bestätigungslinks zur App zurückführen):
Supabase Dashboard → **Authentication → URL Configuration**:

- Site URL: `https://deine-app.vercel.app`
- Redirect URLs: `https://deine-app.vercel.app/**`

---

## Schritt 2: App lokal starten

1. Programme installieren:
   ```bash
   npm install
   ```
2. Datei `.env` im Projektordner anlegen und deine Supabase-Werte eintragen:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
   ```
3. Starten:
   ```bash
   npm run start   # Handy-App (Expo)
   npm run web     # im Browser (inkl. Sprach-Test)
   ```

> Hinweis: Der `anon`-Key ist **absichtlich öffentlich** – er landet ohnehin im
> Browser. Der Schutz der Daten läuft über die Datenbank-Regeln (Row Level
> Security), die beim `supabase db push` automatisch mitkommen. Die *echten*
> Geheimnisse (OpenAI-Key) stehen nur in den Supabase-Secrets, nie im Code.

---

## Schritt 3: Web-Version online stellen (Vercel, optional)

1. Repository mit [Vercel](https://vercel.com) verbinden.
2. In Vercel unter **Project Settings → Environment Variables** eintragen:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
   ```
3. Build-Einstellungen (stehen schon in `vercel.json`):
   - Build Command: `npm run build:web`
   - Output Directory: `dist`

---

## Was die App aktuell kann (MVP)

- Text-Rollenspiel mit der KI
- Szenario-Auswahl
- Speicherung von Sessions und Nachrichten
- Auswertung nach jeder Session
- Verlauf früherer Sessions
- Login über Supabase
- Premium-Status und Limits (noch als Platzhalter)
- Sprach-Modus im Browser vorbereitet (nativ auf dem Handy noch nicht aktiv)
