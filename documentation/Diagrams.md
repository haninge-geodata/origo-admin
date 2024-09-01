# Roller och grupper

```mermaid
graph TD
    A[Groups] -->|Belongs to a role| B[Roles]
    B -->|Belongs to a layer| C[layers]
    B -->|Has permission| D[Permissions]
```

## Behörighet

```mermaid
graph TD;
    Lagret["Lager: Fastighetsgränser"];
    Roll["Roll: Byggnadsingenjör"];
    GruppGISBYGG["Grupp: GIS-BYGG"];
    GruppGISVA["Grupp: GIS-VA"];
    GruppGISMEX["Grupp: GIS-MEX"];

    Lagret -->|Tillhör| Roll;
    Roll -->|Består av| GruppGISBYGG;
    Roll -->|Består av| GruppGISVA;
    Roll -->|Består av| GruppGISMEX;
```


##  Sekvensdiagram
```mermaid
sequenceDiagram
    participant User
    participant APIEndpoint as "Map Instances API Endpoint"
    participant Proxy
    participant Service

    User->>APIEndpoint: Anropar Map Instances med ID
    APIEndpoint->>Service: Hämtar data för Map Instances med ID (Service filtrerar)
    Service->>APIEndpoint: Skickar filtrerad data
    APIEndpoint->>User: Returnerar svar till anvndare
    
    User->>Proxy: Väljer att tända/släcka lager
    Proxy->>Service: Kontrollerar användarens behörighet för lagerändring
    Service-->>Proxy: Returnerar godkännande för lagerändring
    Proxy-->>User: Tillåter användaren att tända/släcka lager
```

## Test
```mermaid
graph TD;
    Lager["Lager VA-ledning"]
    Lager2["Lager Naturskyddsområde"]
    Roll["Roll: Byggnadsingenjör"]
    Roll2["Roll: Miljö"]
    Grupp["Grupp GIS_VA"]
    Grupp2["Grupp GIS_Miljö"]
    Anv["Användare: DAVAAA04"]

    Lager ---> Roll
    Lager ---> Roll2
    Lager2 ---> Roll2
    Roll ---> Grupp
    Roll2 ---> Grupp
    Roll2 ---> Grupp2
    Anv ---> Roll2

```

## Tabell
| Användare   | GIS-lager                         |
|-------------|-----------------------------------|
| Alice       | Vägdata, Byggnader, Höjddata      |
| Bob         | Vattendrag, Markanvändning, Höjddata |
| Carol       | Vegetation, Vägdata, Markanvändning |





## Inloggningsförfarande Origo

```mermaid
sequenceDiagram
    participant User
    participant Origo
    participant Proxy
    participant Admin API
    participant portal.haninge.se
    participant NHAG

    User->>Origo: Browse to Origo
    Origo->>Proxy: Make Admin API request
    Proxy->>Proxy: Check authentication
    Proxy-->>Origo: 401 Unauthorized
    Origo->>Origo: Intercept 401
    Origo->>portal.haninge.se: Redirect to login page
    User->>portal.haninge.se: Enter credentials
    portal.haninge.se->>NHAG: Authenticate with OpenID
    NHAG-->>portal.haninge.se: Authentication response
    portal.haninge.se->>Origo: Redirect to original page (with auth token)
    Origo->>Proxy: Retry Admin API request (with auth token)
    Proxy->>Proxy: Validate token
    Proxy->>Admin API: Forward authenticated request
    Admin API-->>Proxy: Send response
    Proxy-->>Origo: Forward Admin API response
    Origo->>User: Display data
```




## API-key validering Proxy - Origo Admin Api

```mermaid
sequenceDiagram
    participant Proxy
    participant Origo Admin API
    participant Database

    Proxy->>Origo Admin API: Request with API Key
    Origo Admin API->>Origo Admin API: Validate API Key
    alt Invalid API Key
        Origo Admin API-->>Proxy: 401 Unauthorized
    else Valid API Key
        Origo Admin API->>Database: Query data
        Database-->>Origo Admin API: Return data
        Origo Admin API-->>Proxy: 200 OK with data
    end
```


## 

``` mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant Express API
    participant Database

    User->>NextJS: Request with JWT
    NextJS->>NextJS: Validate JWT
    alt Invalid JWT
        NextJS-->>User: 401 Unauthorized
    else Valid JWT
        NextJS->>NextJS: Extract user info from JWT
        NextJS->>NextJS: Create custom auth header (API Key + User Info)
        NextJS->>Express API: Request with custom auth header
        Express API->>Express API: Decode and validate custom auth header
        alt Invalid custom auth header
            Express API-->>NextJS: 401 Unauthorized
        else Valid custom auth header
            Express API->>Database: Query data
            Database-->>Express API: Return data
            Express API-->>NextJS: 200 OK with data
            NextJS-->>User: Return data
        end
    end

```
