# Origo Admin

Origo Admin consists of three services:

- **Client** — Next.js frontend (port 3000)
- **Server** — Express API backend (port 3010)
- **Proxy** — Express proxy for GIS resources with role-based filtering (port 3020)

## Local development with Docker Compose

### Prerequisites

- Docker and Docker Compose
- Node.js 22+ (only needed for generating secrets)

### Quick start (without authentication)

1. Copy `.env.template` to `.env`:

   ```bash
   cp .env.template .env
   ```

2. Generate a token secret:

   ```bash
   npm --prefix server/ run generate-secret-key
   ```

   Copy the output to `TOKEN_SECRET` in `.env`.

3. Build and start the server and database:

   ```bash
   docker compose -f docker-compose.yaml build
   docker compose -f docker-compose.yaml up -d server
   ```

   Wait for the server to become healthy (~10–15 seconds).

4. Generate an API access token:

   ```bash
   docker compose -f docker-compose.yaml exec server node dist/server/src/scripts/generateInitialToken.js
   ```

   Copy the output to `API_ACCESS_TOKEN` in `.env`.

5. Start all services:

   ```bash
   docker compose -f docker-compose.yaml up -d
   ```

6. Visit [http://localhost:3000](http://localhost:3000)

> **Note:** Use `-f docker-compose.yaml` to avoid loading `docker-compose.override.yaml`, which enables authentication and starts an Authentik IdP. To include authentication, omit the `-f` flag — see [With authentication](#with-authentication-authentik-idp) below.

### With authentication (Authentik IdP)

The override file (`docker-compose.override.yaml`) adds a local Authentik identity provider and enables authentication for all services.

1. Complete steps 1–4 from [Quick start](#quick-start-without-authentication).

2. Start the IdP:

   ```bash
   docker compose up -d idp idp-worker
   ```

3. Go to `http://localhost:3050/if/flow/initial-setup/` and create an admin account.

4. In the Authentik admin interface, navigate to **Applications** and click **Create with Wizard**:
   - Name: `Origo Admin`, Slug: `origo-admin`
   - Provider type: OIDC
   - Authorization flow: Implicit, Client type: Public
   - Redirect URI: Regex `.*`
   - Subject mode: Based on User's username

5. Copy the generated Client ID to `IDP_CLIENT_ID` in `.env`.

6. Create an admin role in MongoDB:

   ```bash
   docker compose exec mongodb mongosh "mongodb://root:password@localhost/origoadmin?authSource=admin" \
     --eval 'db.getCollection("roles").insertOne({actors: [{"name": "akadmin", "type": "User"}], permissions: [], role: "Administratör"})'
   ```

7. Start all services:

   ```bash
   docker compose up -d
   ```

8. Visit [http://localhost:3000](http://localhost:3000)

### With your own IdP

1. Complete steps 1–4 from [Quick start](#quick-start-without-authentication).

2. Update `.env` with your IdP configuration:

   ```
   IDP_CLIENT_ID=<your client id>
   IDP_CLIENT_SECRET=<your client secret>
   IDP_SCOPE=openid groups
   IDP_REDIRECT_URI=http://localhost:3000/api/auth/callback/oidc
   IDP_WELLKNOWN_URL=<your .well-known/openid-configuration URL>
   IDP_TOKEN_URL=<your token endpoint>
   ```

3. Set `AUTH_ENABLED` to `"true"` in `docker-compose.yaml` for both the client and server services.

4. Start all services:

   ```bash
   docker compose -f docker-compose.yaml up -d
   ```

## Deploy to Azure Container Apps

This section describes how to deploy Origo Admin to Azure using Container Apps. The three application services (client, server, proxy) run as separate containers. MongoDB is expected to be provided externally (e.g. Azure Cosmos DB for MongoDB, MongoDB Atlas, or a self-hosted instance).

### Prerequisites

- Azure CLI (`az`) installed and logged in
- Docker (for local builds) or use `az acr build` for cloud builds
- An Azure subscription
- A MongoDB instance accessible from Azure

### Step 1: Set up Azure resources

```bash
# Set your subscription
az account set --subscription <subscription-id>

# Create a resource group
az group create --name <resource-group> --location swedencentral

# Create a container registry
az acr create --resource-group <resource-group> --name <registry-name> --sku Basic
az acr update --name <registry-name> --admin-enabled true
```

### Step 2: Build and push images

Build directly in Azure (recommended — ensures linux/amd64 architecture):

```bash
az acr build --registry <registry-name> --image origo-admin-server:latest --file ./server/Dockerfile --platform linux/amd64 .
az acr build --registry <registry-name> --image origo-admin-client:latest --file ./client/Dockerfile --platform linux/amd64 .
az acr build --registry <registry-name> --image origo-admin-proxy:latest  --file ./proxy/Dockerfile  --platform linux/amd64 .
```

### Step 3: Create the Container Apps environment

```bash
az containerapp env create \
  --name <env-name> \
  --resource-group <resource-group> \
  --location swedencentral
```

### Step 4: Retrieve ACR credentials

```bash
az acr credential show --name <registry-name> --query "{username:username, password:passwords[0].value}" -o table
```

### Step 5: Deploy the server

The server needs internal ingress (not publicly accessible). Replace `<mongodb-connection-string>` with the full connection string to your MongoDB instance.

```bash
az containerapp create --name server \
  --resource-group <resource-group> \
  --environment <env-name> \
  --image <registry-name>.azurecr.io/origo-admin-server:latest \
  --registry-server <registry-name>.azurecr.io \
  --registry-username <acr-username> \
  --registry-password <acr-password> \
  --min-replicas 1 --max-replicas 3 \
  --cpu 0.5 --memory 1.0Gi \
  --ingress internal --target-port 3010 \
  --env-vars \
    PORT=3010 \
    BASE_PATH=/api \
    DATABASE="<mongodb-connection-string>" \
    TOKEN_SECRET="<generated-secret>" \
    AUTH_ENABLED=false \
    UPLOAD_FOLDER=/data/uploads \
    USE_AZURE_STORAGE=false \
    SECURE_FAVOURITES=false \
    NODE_ENV=production
```

To use Azure Blob Storage for file uploads instead of local disk, replace the storage-related variables:

```bash
    USE_AZURE_STORAGE=true \
    AZURE_STORAGE_CONNECTION_STRING="<your-connection-string>" \
    AZURE_CONTAINER_NAME="<your-container-name>" \
```

Note the server's internal FQDN from the output (e.g. `server.internal.<env-domain>`).

### Step 6: Deploy the proxy

```bash
az containerapp create --name proxy \
  --resource-group <resource-group> \
  --environment <env-name> \
  --image <registry-name>.azurecr.io/origo-admin-proxy:latest \
  --registry-server <registry-name>.azurecr.io \
  --registry-username <acr-username> \
  --registry-password <acr-password> \
  --min-replicas 1 --max-replicas 2 \
  --cpu 0.25 --memory 0.5Gi \
  --ingress internal --target-port 3020 \
  --env-vars \
    PORT=3020 \
    PROXY_BASE_PATH=proxy \
    RESOURCES_ENDPOINT_URL="https://<server-fqdn>/api/proxy/resources" \
    ROLES_ENDPOINT_URL="https://<server-fqdn>/api/proxy/roles" \
    MAPINSTANCES_ENDPOINT_URL="https://<server-fqdn>/api" \
    API_ACCESS_TOKEN="<api-access-token>" \
    NODE_ENV=production
```

### Step 7: Deploy the client

The client is the only service with external (public) ingress.

```bash
az containerapp create --name client \
  --resource-group <resource-group> \
  --environment <env-name> \
  --image <registry-name>.azurecr.io/origo-admin-client:latest \
  --registry-server <registry-name>.azurecr.io \
  --registry-username <acr-username> \
  --registry-password <acr-password> \
  --min-replicas 1 --max-replicas 3 \
  --cpu 0.5 --memory 1.0Gi \
  --ingress external --target-port 3000 \
  --env-vars \
    BASE_URL="https://<server-fqdn>/api/" \
    AUTH_ENABLED=false \
    PORT=3000 \
    NODE_ENV=production
```

The client's public URL is shown in the output.

### Architecture overview

```
Internet → Client (external, port 3000)
               ↓ internal
           Server (internal, port 3010) → MongoDB (external)
               ↕ internal
           Proxy (internal, port 3020)
```

- Only the **client** has external ingress (public URL with HTTPS).
- **Server** and **proxy** communicate internally within the Container Apps environment.
- **MongoDB** is provided as an external managed service.
- Internal service-to-service communication uses HTTPS via the internal FQDN.

### Updating a deployment

To update a service after code changes:

```bash
# Rebuild the image
az acr build --registry <registry-name> --image origo-admin-server:latest --file ./server/Dockerfile --platform linux/amd64 .

# Update the container app to use the new image
az containerapp update --name server --resource-group <resource-group> --image <registry-name>.azurecr.io/origo-admin-server:latest
```

### Tear down

To remove all Azure resources:

```bash
az group delete --name <resource-group> --yes --no-wait
```

## Project structure

```
├── client/          Next.js frontend
│   └── Dockerfile
├── server/          Express API backend
│   └── Dockerfile
├── proxy/           Express GIS proxy
│   └── Dockerfile
├── shared/          Shared TypeScript interfaces
├── docker-compose.yaml            Base configuration (no auth)
├── docker-compose.override.yaml   Adds Authentik IdP and enables auth
├── deploy-azure.sh                Automated Azure Container Apps deployment script
├── .env.template                  Environment variable template
└── .dockerignore                  Excludes unnecessary files from Docker builds
```

## Environment variables

See `.env.template` for required variables. Key variables:

| Variable | Description |
|----------|-------------|
| `TOKEN_SECRET` | JWT signing secret. Generate with `npm --prefix server/ run generate-secret-key` |
| `API_ACCESS_TOKEN` | API access token. Generate via `generateInitialToken.js` after server start |
| `IDP_CLIENT_ID` | OIDC client ID (only needed with authentication enabled) |
| `IDP_CLIENT_SECRET` | OIDC client secret |
| `IDP_WELLKNOWN_URL` | OIDC discovery endpoint |
| `IDP_TOKEN_URL` | OIDC token endpoint |
| `IDP_SCOPE` | OIDC scopes (e.g. `openid groups`) |
| `IDP_REDIRECT_URI` | OIDC redirect URI |
| `USE_AZURE_STORAGE` | Set to `true` to use Azure Blob Storage for file uploads |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string (required when `USE_AZURE_STORAGE=true`) |
| `AZURE_CONTAINER_NAME` | Azure Blob Storage container name (required when `USE_AZURE_STORAGE=true`) |
