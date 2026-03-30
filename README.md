# Love Shuffle

![Bild](public/assets/heart-badge.svg)

Eine kleine App, die euch in einer gemütlichen Runde zufällige Herzensfragen stellt — 
für mehr Nähe, Gespräche und ehrliche Momente zu zweit.

Bietet sich perfekt für Paare an, die etwas Abwechslung in ihre Gespräche bringen wollen, 
oder einfach mal wieder tiefgründige Fragen stellen möchten.


## Kurzbeschreibung

- Fragen werden zur Laufzeit aus `public/data/questions.json` geladen.
- Die Kategorien sind fest vorgegeben und werden validiert.
- Gespielte, übersprungene und dauerhaft gesperrte Fragen werden im Browser gespeichert.
- Die App ist mobile-first gestaltet und kann statisch ausgeliefert werden.

## Highlights

- Mobile-first Design mit Intro-, Fragen- und Glückwunsch-Ansicht
- Shuffle per Button, Leertaste und Enter
- Kategorienfilter mit Modal
- Temporäres Überspringen oder dauerhaftes Sperren einzelner Fragen
- Fortschritt, History und Sperren bleiben im Browser erhalten
- Laufzeitvalidierung der Fragen-Datei mit genauer Fehleranzeige im Frontend
- Docker-Multi-Stage-Build mit nginx für statisches Hosting

## Fragen-Datei

Die App lädt ihre Fragen aus:

```text
/data/questions.json
```

### Format

Die Datei muss ein JSON-Array mit Objekten sein:

```json
[
  {
    "id": "q001",
    "text": "Wofür fühlst du dich in unserer Beziehung im Moment am meisten dankbar?",
    "category": "verbundenheit-wachstum"
  },
  {
    "id": "q002",
    "text": "Was ist deine liebste Erinnerung an unsere gemeinsame Zeit?",
    "category": "erinnerungen"
  }
]
```

### Pflichtfelder

- `id`
  Muss ein eindeutiger, nicht-leerer String sein.
- `text`
  Muss ein nicht-leerer String sein.
- `category`
  Muss eine der erlaubten Kategorien sein.

### Erlaubte Kategorien

- `sex-intimitaet`
- `verbundenheit-wachstum`
- `erinnerungen`
- `beziehung`
- `ueber-dich`

## Eigene Fragen-Datei mit Docker Compose mounten

Du kannst eine eigene Datei vom Host in den Container mounten und damit die Standardfragen ersetzen.

Beispiel `docker-compose.yml`:

```yaml
services:
  love-shuffle:
    image: beberhardt/love-shuffle-app:latest
    ports:
      - "8080:80"
    restart: unless-stopped
    volumes:
      - ./questions.json:/usr/share/nginx/html/data/questions.json:ro
```

Danach starten:

```bash
docker compose up -d
```

Die App lädt dann zur Laufzeit deine gemountete Datei statt der Standarddatei aus dem Image.

## Entwickler / Local Development

### Requirements

- Node.js (Empfohlen: v24.x LTS). Die Datei `.nvmrc` enthält die gewünschte Version.
- npm
- Docker zur lokalen Container-Ausführung falls gewünscht.

#### 1) Node / Environment vorbereiten

```bash
# mit nvm (empfohlen)
nvm install
nvm use
```
(Unter Windows eventuell via `nvm use $(Get-Content .nvmrc).replace( 'v', '' );`

#### 2) Abhängigkeiten installieren

```bash
npm install
```

#### 3) Entwicklungsserver starten

```bash
npm run dev
```

Die App ist dann typischerweise unter `http://localhost:5173` erreichbar.

#### 4) Produktions-Build

```bash
npm run build
```

Output liegt in `dist/`.

#### 5) Vorschau des Builds

```bash
npm run preview
```

## Tests

E2E-Tests mit Playwright:

```bash
npm run test:e2e
```

Headed/UI-Varianten hängen von deinen vorhandenen npm-Skripten ab.
