# Love Shuffle

![Bild](public/assets/heart-badge.svg)

Eine kleine App, die euch in einer gemütlichen Runde zufällige Herzensfragen stellt — 
für mehr Nähe, Gespräche und ehrliche Momente zu zweit.

Bietet sich perfekt für Paare an, die etwas Abwechslung in ihre Gespräche bringen wollen, 
oder einfach mal wieder tiefgründige Fragen stellen möchten.


## Kurzbeschreibung

- Fragen kommen aus `src/data/questions.json` und werden per Zufall angezeigt.
- Fokus auf Mobile-First UI: Hero-Intro, klarer Fragenmodus und konzentrierte Karte im Mittelpunkt.
- Persistenz: bereits gespielte Fragen werden im Browser gespeichert (localStorage); man kann sie zurücksetzen.

## Highlights / Features

- Mobile-first Design (responsive).
- Shuffle-Button + Tastatur-Shortcut (Leertaste) für Desktop.
- Persistenz der bereits gespielten Fragen (localStorage) mit Reset-Funktion.
- Zentrierte Fragekarte im Fragenmodus, App-Bar mit Status im Header.
- Schönes Congrats-View mit Konfetti, wenn alle Fragen gespielt wurden.
- Docker-Multi-Stage-Build + nginx für statisches Hosting.
- PWA-Meta / manifest für Standalone/Fullscreen auf Mobilgeräten (optional installierbar).

## Entwickler / Local Development

### Requirements

- Node.js (Empfohlen: v24.x LTS). Die Datei `.nvmrc` enthält die gewünschte Version.
- npm (oder pnpm/yarn)
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


## Docker / Deployment (Docker Compose)

Erstellung einer docker-compose.yml mit Inhalt:

```yaml
services:
  love-shuffle:
    image: beberhardt/love-shuffle-app:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

Starten:

```bash
docker compose up -d
```
