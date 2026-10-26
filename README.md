# Nordtravel

Nordtravel är en webbapp för reseupptäckter som låter dig utforska länder runt om i världen. Bläddra bland och sök i en lista med 250+ länder, öppna en landssida för fakta, namn på lokala språk och officiella namn, en Wikipedia-sammanfattning och aktuellt väder – och spara sedan länder som favoriter och jämför två av dem sida vid sida.


## Funktioner

- **Utforska länder** — sök på land eller huvudstad, filtrera på region och sortera på namn, befolkning eller yta (stigande/fallande).
- **Landssidor** — huvudstad, befolkning, yta, språk, valuta, tidszoner, Wikipedia-beskrivning/bild, namn på lokala språk och officiellt namn samt aktuellt väder.
- **Favoriter** — spara länder med hjärtknappen (på kort och landssidor). Lagras i `localStorage`, så de finns kvar per webbläsare.

### Avancerat:
- **Jämför favoriter** — jämför två sparade länder på befolkning, yta och aktuellt väder; det högsta värdet i varje rad märks med ”Highest”.
- **URL-styrt tillstånd** — sökning, region, sortering, paginering och jämförelsevalet syns i URL:en.
- Responsiv layout och tillgänglig markup (semantiska tabeller, etiketter, fokusmarkeringar och `lang`-attribut för namn på lokala språk).

## Techstack

- [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- React 19 + TypeScript
- Tailwind CSS v4
- TanStack React Query
- react-hook-form + Zod
- Komponenter i shadcn/ui-style, Radix Slot, lucide-react-ikoner

## Kom igång

### Förutsättningar

- Node.js 20+ (eller 18.18+)
- npm
- API-nyckel för REST Countries från [restcountries.com](https://restcountries.com)

### 1. Installera dependencies

```bash
npm install
```

### 2. Konfigurera miljövariabler

Kopiera exempelfilen:

```bash
cp .env.example .env.local
```

I Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Redigera sedan `.env.local` och lägg till din nyckel:

```env
REST_COUNTRIES_API_KEY=your-rest-countries-api-key
```

> Landdata hämtas på servern, så API-nyckeln exponeras aldrig i webbläsaren.

### 3. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Tillgängliga skript

| Kommando | Beskrivning |
| --- | --- |
| `npm run dev` | Startar utvecklingsservern |
| `npm run build` | Skapar en produktionsbuild |
| `npm start` | Kör produktionsbygget |
| `npm run lint` | Kör ESLint |
| `npx tsc --noEmit` | Typkontrollerar projektet |

## Projektstruktur

```
app/          Routes, layout, API-route-handlers, globala stilar
components/   UI-komponenter (landkort, utforskare, jämförelsevy, header, …)
context/      Favoriternas tillstånd (Context + localStorage)
hooks/        React Query- och formulärhjälpare
lib/          Datahämtning, API-klienter och verktyg
docs/         Projektskiss och resurser
```

## Datakällor

- [REST Countries v5](https://restcountries.com/) — landsdata och flaggor
- [Open-Meteo](https://open-meteo.com/) — aktuellt väder
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) — landssammanfattningar och bilder

## AI-redovisning
 - Copilot Chat GPT-6 Luna för projektscaffolding
 - Copilot Deepseek 4.1 Flash för avancerade funktioner och mindre ändringar 
 - Google Gemini för hjälp med bash/git
## Anteckningar

- Favoriter lagras i `localStorage` (per webbläsare); det finns inga användarkonton.
- Länder utan flagga i API:et (t.ex. Abchazien, Norra Cypern, Somaliland, Sydossetien) använder en reservflagga från Wikimedia Commons.
- Väder visas för varje lands huvudstad och kräver koordinater för huvudstaden.


## Reflektioner

Jag valde att använda AI så mycket som möjligt, då de jag känner i branschen säger att det är vad de gör. Jag hade en del svårigheter med att få Deepseek for Copilot att fungera och fick använda deras chat service för att hitta alla inställningar som behövdes för att köra OAI Compatible Copilot. jag hade också lite krångel med git då jag var project leader på vår versionshanteringskurs så hade jag tillgång till main och behövde inte göra några pull requests. Därför hade jag väldigt mycket svårigheter med git och en del commits ser lite tokiga ut då jag glömt ansluta till repot ibland.
