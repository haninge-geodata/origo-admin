# Origo Admin Client

## Installation lokalt
För att köra klienten behöver först server/backend api:et sättas upp korrekt. Efter att server har satts upp korrekt börja då med att kopiera .env.template och döp den till .env.
Justera de fält i .env-filen som behöver justeras, ska autentisering användas så ska en api-nyckel ha genererats i server.
Förutsatt att server-api:et körs starta sedan klienten med

```
npm run dev
```

## Installation
Installationsguiden förutsätter att Origo Admin repository:t finns lokalt på datorn börja annars med att klona repository:t.

### IIS (Windows Service)
- Börja med att skapa en .env-fil i roten på client-katalogen.
- Kopiera innehållet från .env.template och lägg in korrekta värden för resp. parameter.
- Öppna Powershell eller terminalen i 'client'-mappen.
- Kör `npm run build:iis` om du är på windows och `npm run build:mac:iis` om du är på mac
- Kopiera sedan äver dist_iis som skapats i client-mappen till servern.
- Lägg katalogen där du vill ha den deployad
- Öppna sedan .env.production och justera eventuella miljövariabler.
- Kör `npm install` i katalogen
- Kör sedan `npm install node-windows` för att installera node-paktet som gör det möjligt att köra nodejs som en windows service.
- Öppna sedan tasks katalogen och justera de två .js-filerna där genom att ange den absoluta sökvägen till server.js.
- Kör sedan `node create_windowsservice.js` för att installera applikationen som en windows service.
- Applikationen ska nu vara nåbar via angiven port, default: 3000