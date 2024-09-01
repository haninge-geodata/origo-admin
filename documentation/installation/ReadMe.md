# Initial Token Generation för Admin-åtkomst

## Introduktion

Detta dokument beskriver processen för att generera den första "super admin"-token som krävs för att koppla NextJS-appen till Express-backend under installationen. Denna token ger full åtkomst till systemet och bör hanteras med största försiktighet.

## Förutsättningar

- Node.js och npm installerat på din maskin
- Tillgång till projektets källkod
- MongoDB installerat och konfigurerat

## Steg-för-steg guide

1. **Förbered miljön**

   Säkerställ att du har alla nödvändiga miljövariabler konfigurerade i en `.env`-fil i projektets rot. Detta bör inkludera din MongoDB-anslutningssträng:


2. **Generera initial token**

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
API_ACCESS_TOKEN=din_genererade_token_här
```

5. **Använd token i NextJS**

I dina NextJS API-rutter, används token för att autentisera anrop till Express-backend:

```typescript
const response = await fetch('http://din-express-api/någon-endpoint', {
  headers: {
    'Authorization': `Bearer ${process.env.API_ACCESS_TOKEN}`
  }
});