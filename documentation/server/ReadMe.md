# Dokumentation

# Installation Windows Server

- Följande behöver finnas/installeras på Servern:
  - IIS
  - NodeJS
  - MongoDB
  - Konfigurering av Windows Server
  - Installation av URL-Rewrite
  - Installation av OrigoAdmin Client.
  
## Installation av IIS
1. Öppna Startmenyn och skriv "features" och välj "Turn Windows Features on or off"
2. Klicka i Internet Information Services och klicka "Ok"
3. Vänta på att installationen ska slutföras

## Installation av Nodejs
1. Verifiera om nodejs är installerat på servern genom att köra `node --version`
   Om node inte är installerat så hittas inte kommandot av windows och det behöver därför installeras. Node kan installeras på flera olika sätt men här nämns bara ett, installation via deras installer på node's webbplats. https://nodejs.org  
2. Gå till Node.js och ladda hem nodejs installer och installera detta på servern, när installationen är klar kan du verifiera detta genom igen köra kommandot `node --version`

## Installation av MongoDB
1. Ladda ner MongoDB Community Server från MongoDB:s officiella webbplats. https://www.mongodb.com/try/download/community
2. Följ installationsguiden och välj Complete för att installera alla komponenter.
3. Konfigurera MongoDB att köra som en tjänst genom installationsguiden.
4. Starta MongoDB-tjänsten via Services.msc.

## Installationsguide för mongosh (MongoDB Shell)
1. Gå till [MongoDB:s officiella nedladdningssida](https://www.mongodb.com/try/download/shell) och ladda ner den senaste versionen av `mongosh` för Windows.
2. Dubbelklicka på den nedladdade filen och följ instruktionerna på skärmen för att installera `mongosh`.
3. Öppna Kommandotolken och skriv `mongosh --version` för att kontrollera att installationen har gått bra.

## Skapa en ny databas och sätta upp användare.
1. Börja med att köra `mongosh` i shell.
2. Skapa en ny databas genom att köra `use origoadmin`
3. Skapa sedan en användare för origoadmin genom att köra:
   ```
    db.createUser({
    user: "admin",
    pwd: "password",
    roles: [{ role: "readWrite", db: "origoadmin" }]
    })
   ```
4. Kontrollera att användaren har lagts upp korrekt genom att köra `show users`
5. Öppna sedan MongoDB Compass och anslut till databasen med användaren: `mongodb://origoadmin:<pwd>@localhost:27017/origoadmin`

## Fyll på med installationsförfarande för Node windows


# Docker
Denna dokumentation beskriver hur du bygger och kör Docker-containrar för både klient- och serverdelarna av projektet, med en gemensam shared-katalog. Dockerfilerna för klient- och serverapplikationerna är placerade inuti deras respektive kataloger, men byggena hanteras från projektroten för att inkludera nödvändiga delade resurser.

Förutsättningar
Innan du börjar, se till att du har följande installerat:

Docker
Docker Compose (valfritt, rekommenderas för att köra multi-container applikationer)
Bygginstruktioner
Bygga Klientapplikationen
För att bygga Docker-bilden för klientapplikationen, navigera till projektroten och använd följande kommando:

```
docker build -t min-client-app -f ./client/Dockerfile .
```

Detta kommando bygger klientapplikationen med Dockerfile som finns i client-katalogen. Notera att byggkontexten är satt till projektroten (.), vilket gör det möjligt att inkludera filer från shared-katalogen i byggprocessen.

Bygga Serverapplikationen
Liknande process används för att bygga serverapplikationen:
```
docker build -t min-server-app -f ./server/Dockerfile .
```

Kommandot bygger serverapplikationen med Dockerfile som finns i server-katalogen, och inkluderar också shared-resurser tack vare den gemensamma byggkontexten.

Körinstruktioner
För att köra din nybyggda Docker-bild, använd docker run-kommandot. Exempel för att köra klientapplikationen:
```
docker run -p 3000:3000 origo-admin-client
```

Detta kommando startar klientapplikationen och mappar port 3000 från containern till port 3000 på din värdmaskin, vilket gör applikationen tillgänglig på http://localhost:3000.

Använd motsvarande kommando för att starta serverapplikationen, se till att anpassa portmappningen efter behov.

Användning av Docker Compose (Valfritt)
För att enklare hantera multi-container applikationer, inklusive beroenden mellan klient-, server-, och databastjänster, rekommenderas det att använda Docker Compose. Skapa en docker-compose.yml-fil i projektroten med konfiguration för alla tjänster. Se tidigare exempel på hur en sådan fil kan se ut.

Sammanfattning
Denna dokumentation beskriver hur du bygger och kör Docker-containrar för ditt projekt med separata Dockerfiler för klient- och serverapplikationerna, medan du inkluderar delade resurser från shared-katalogen. Genom att följa dessa instruktioner kan du effektivt hantera ditt projekt i Docker-miljön.


## Felsökning
```
docker run -it --entrypoint /bin/sh origo-admin-client
```
1. Börja med att köra `mongosh` i shell.
2. Skapa en ny databas genom att köra `use origoadmin`
3. Skapa sedan en användare för origoadmin genom att köra:
   ```
    db.createUser({
    user: "<användarnamn>",
    pwd: "<lösenord>",
    roles: [{ role: "readWrite", db: "origoadmin" }]
    })
   ```
4. Kontrollera att användaren har lagts upp korrekt genom att köra `show users`
