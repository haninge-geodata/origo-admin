# Origo Admin Server

## Installation lokalt

### Installation av MongoDB

1. Ladda ner MongoDB Community Server från MongoDB:s officiella webbplats: [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Följ installationsguiden och välj "Complete" för att installera alla komponenter.
3. Konfigurera MongoDB att köra som en tjänst genom installationsguiden.

### Skapa den första användaren och databasen `origoadmin` i MongoDB med `mongosh`
#### Installation
1. Starta `mongosh` genom att öppna terminalen och skriva:
```bash
   mongosh
```
2.  Anslut till MongoDB-servern. Om du kör MongoDB lokalt, kan du använda standardanslutningen:
```bash
mongosh "mongodb://localhost:27017"
```
3. Skapa databasen origoadmin genom att växla till den (databasen skapas automatiskt när du kör ett kommando):
```bash
use origoadmin
```

4. Skapa en användare kopplad till databasen origoadmin:
```bash
db.createUser({
  user: "origoadmin",
  pwd: "dittSäkraLösenord",
  roles: [ { role: "dbOwner", db: "origoadmin" } ]
})
```
5. Bekräfta att användaren skapades korrekt genom att köra:
```bash
db.getUsers()
```

### Docker Container

För att köra MongoDB som en Docker-container kan du använda en `docker-compose.yaml`-fil som definierar konfigurationen. Följ stegen nedan, detta förutsätter att Docker är installerat på datorn.
Docker-Desktop hittas här: https://www.docker.com/products/docker-desktop/ 

#### Steg 1: Skapa en `docker-compose.yaml`-fil
1. Skapa en `docker-compose.yaml`. Här är ett exempel på hur filen kan se ut:

```yaml
version: "3.8"
services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: origoadmin
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

2. Starta MongoDB-containern genom att öppna en terminal och navigera till database-mappen där din docker-compose.yaml-fil finns. Starta MongoDB-containern med följande kommando:
```bash
docker-compose up -d
```
3. Containern kommer att starta i bakgrunden. Du kan kontrollera att den körs korrekt genom att köra:
```bash
docker ps
```
4. Anslut till MongoDB
Du kan nu ansluta till mongodb genom att följa stegen 1-5 i sektionen "Installation" ovan.

## Installation Origoadmin Server lokalt
Kopiera .env.template och döp den nya filen till .env. Justera de fält i .env-filen som behöver justeras, ska autentisering användas så ska en api-nyckel genereras enligt stegen nedan.
Se steg "Behörighetsstyrning installation" nedan för generering av api-nyckel.

Om swagger ska genereras görs detta sedan genom att köra kommandot nedan från (server-) projektets rot:

```
npm run generate-swagger
```

Starta sedan api:et lokalt för utveckling med:
```
npm run dev
```

För att installera api:et som en Windows-tjänst, korrigera sökvägen i `.\installation\tasks\create_windowsservice_server.js` och kör:

```
node ./installation/tasks/create_windowsservice_server.js
```

# Behörighetsstyrning installation
## Initial Token Generation för Admin-åtkomst

Detta dokument beskriver processen för att generera den första "admin"-token som krävs för att koppla NextJS-appen till Express-backend under installationen. Denna token ger full åtkomst till systemet och bör hanteras med försiktighet.

### Förutsättningar

- Node.js och npm installerat på din maskin
- Tillgång till projektets källkod
- MongoDB installerat och konfigurerat

### Steg-för-steg guide

1. **Förbered miljön**

   Säkerställ att du har alla nödvändiga miljövariabler konfigurerade i en `.env`-fil i projektets rot. Detta inkluderar din MongoDB-anslutningssträng:


2. Starta med att köra scriptet generateSecretKey som genererar en privat-nyckel som sedan används för att kryptera/avkryptera tokens:
```code
npm run generate-secret-key
```
Detta värde sätts sedan för TOKEN_SECRET i .env-filen.

1. **Generera initial token**

   Öppna ett terminalfönster i projektets rotmapp och kör följande kommando:


```code
npm run generate-initial-token
```

Detta kommer att köra ett skript som genererar en ny token med fulla behörigheter.

3. **Spara token säkert**

   Efter att skriptet har körts kommer en token att visas i konsolen. Det är VIKTIGT att du sparar denna token på ett säkert sätt. Den kommer inte att visas igen.


Exempel på utdata:
```code
Initial Super Admin Token created.
API-ACCESS-TOKEN:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Please store this token securely. It will not be shown again.
```

4. **Konfigurera NextJS-appen**

   Lägg till den genererade token i NextJS-appens miljövariabler. Skapa eller uppdatera en `.env`-fil i NextJS-projektets rot:

```code
PROTECTED_API_ACCESS_TOKEN=din_genererade_token_här
```

5. **Använd token i NextJS**

I dina NextJS API-rutter, används token för att autentisera anrop till Express-backend:

```typescript
const response = await fetch('http://din-express-api/någon-endpoint', {
  headers: {
    'Authorization': `Bearer ${API_ACCESS_TOKEN}`
  }
});