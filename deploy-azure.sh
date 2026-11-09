#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Configuration — update these values before running
# ==============================================================================

SUBSCRIPTION_ID=""              # Azure subscription ID
RESOURCE_GROUP="origo-admin"    # Name for the Azure resource group
LOCATION="swedencentral"        # Azure region
ACR_NAME="origoadminregistry"   # Container Registry name (globally unique, alphanumeric only)
ENV_NAME="origo-admin-env"      # Container Apps environment name

# MongoDB — connection string to an existing MongoDB instance
MONGODB_CONNECTION_STRING=""    # e.g. "mongodb+srv://user:pass@cluster.mongodb.net/origoadmin?retryWrites=true"

# Secrets — generate TOKEN_SECRET with: npm --prefix server/ run generate-secret-key
TOKEN_SECRET=""
API_ACCESS_TOKEN=""             # Generate after first server deploy, then re-run this script

# Azure Blob Storage (leave empty to use local file storage inside the container)
AZURE_STORAGE_CONNECTION_STRING=""  # e.g. "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
AZURE_CONTAINER_NAME=""             # e.g. "media"

# OIDC (leave empty to deploy without authentication)
IDP_WELLKNOWN_URL=""
IDP_TOKEN_URL=""
IDP_CLIENT_ID=""
IDP_CLIENT_SECRET=""
IDP_SCOPE=""
IDP_REDIRECT_URI=""

# ==============================================================================
# Validation
# ==============================================================================

missing=()
[ -z "$SUBSCRIPTION_ID" ]            && missing+=("SUBSCRIPTION_ID")
[ -z "$RESOURCE_GROUP" ]             && missing+=("RESOURCE_GROUP")
[ -z "$ACR_NAME" ]                   && missing+=("ACR_NAME")
[ -z "$MONGODB_CONNECTION_STRING" ]  && missing+=("MONGODB_CONNECTION_STRING")
[ -z "$TOKEN_SECRET" ]               && missing+=("TOKEN_SECRET")

if [ ${#missing[@]} -gt 0 ]; then
  echo "ERROR: The following required variables are not set:"
  printf '  - %s\n' "${missing[@]}"
  echo ""
  echo "Edit the configuration section at the top of this script and try again."
  exit 1
fi

AUTH_ENABLED="false"
if [ -n "$IDP_CLIENT_ID" ] && [ -n "$IDP_WELLKNOWN_URL" ]; then
  AUTH_ENABLED="true"
fi

USE_AZURE_STORAGE="false"
if [ -n "$AZURE_STORAGE_CONNECTION_STRING" ] && [ -n "$AZURE_CONTAINER_NAME" ]; then
  USE_AZURE_STORAGE="true"
fi

echo "=== Origo Admin — Azure Container Apps Deploy ==="
echo ""
echo "  Subscription:  $SUBSCRIPTION_ID"
echo "  Resource group: $RESOURCE_GROUP"
echo "  Location:       $LOCATION"
echo "  Registry:       $ACR_NAME"
echo "  Auth enabled:   $AUTH_ENABLED"
echo "  Azure Storage:  $USE_AZURE_STORAGE"
echo ""

# ==============================================================================
# 1. Azure setup
# ==============================================================================

echo ">>> Setting subscription..."
az account set --subscription "$SUBSCRIPTION_ID"

echo ">>> Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" -o none

echo ">>> Creating container registry..."
az acr create --resource-group "$RESOURCE_GROUP" --name "$ACR_NAME" --sku Basic -o none
az acr update --name "$ACR_NAME" --admin-enabled true -o none

# ==============================================================================
# 2. Build and push images
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ">>> Building server image..."
az acr build --registry "$ACR_NAME" \
  --image origo-admin-server:latest \
  --file ./server/Dockerfile \
  --platform linux/amd64 "$SCRIPT_DIR" -o none

echo ">>> Building client image..."
az acr build --registry "$ACR_NAME" \
  --image origo-admin-client:latest \
  --file ./client/Dockerfile \
  --platform linux/amd64 "$SCRIPT_DIR" -o none

echo ">>> Building proxy image..."
az acr build --registry "$ACR_NAME" \
  --image origo-admin-proxy:latest \
  --file ./proxy/Dockerfile \
  --platform linux/amd64 "$SCRIPT_DIR" -o none

# ==============================================================================
# 3. Container Apps environment
# ==============================================================================

echo ">>> Creating Container Apps environment..."
az containerapp env create \
  --name "$ENV_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" -o none 2>/dev/null || true

ACR_SERVER="${ACR_NAME}.azurecr.io"
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" -o tsv)

# ==============================================================================
# 4. Deploy server
# ==============================================================================

echo ">>> Deploying server..."
az containerapp create --name server \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENV_NAME" \
  --image "${ACR_SERVER}/origo-admin-server:latest" \
  --registry-server "$ACR_SERVER" \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --min-replicas 1 --max-replicas 3 \
  --cpu 0.5 --memory 1.0Gi \
  --ingress internal --target-port 3010 \
  --env-vars \
    "PORT=3010" \
    "HOST=0.0.0.0" \
    "BASE_PATH=/api" \
    "SWAGGER_URL_SUFFIX=swagger" \
    "DATABASE=${MONGODB_CONNECTION_STRING}" \
    "UPLOAD_FOLDER=/data/uploads" \
    "UPLOAD_URL=placeholder" \
    "MAPINSTANCE_ROUTE_PATH=placeholder" \
    "USE_AZURE_STORAGE=${USE_AZURE_STORAGE}" \
    "AZURE_STORAGE_CONNECTION_STRING=${AZURE_STORAGE_CONNECTION_STRING}" \
    "AZURE_CONTAINER_NAME=${AZURE_CONTAINER_NAME}" \
    "TOKEN_SECRET=${TOKEN_SECRET}" \
    "AUTH_ENABLED=${AUTH_ENABLED}" \
    "SECURE_FAVOURITES=false" \
    "NODE_ENV=production" \
  -o none

SERVER_FQDN=$(az containerapp show --name server --resource-group "$RESOURCE_GROUP" \
  --query "properties.configuration.ingress.fqdn" -o tsv)
echo "    Server FQDN: $SERVER_FQDN"

# Update UPLOAD_URL and MAPINSTANCE_ROUTE_PATH now that we know the FQDN
az containerapp update --name server --resource-group "$RESOURCE_GROUP" \
  --set-env-vars \
    "UPLOAD_URL=https://${SERVER_FQDN}/api/uploads" \
    "MAPINSTANCE_ROUTE_PATH=https://${SERVER_FQDN}/api/mapinstances" \
    "PROXY_UPDATE_URL=https://proxy.internal.${SERVER_FQDN#server.internal.}/proxy/refresh-cache" \
  -o none

# ==============================================================================
# 5. Deploy proxy
# ==============================================================================

echo ">>> Deploying proxy..."
az containerapp create --name proxy \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENV_NAME" \
  --image "${ACR_SERVER}/origo-admin-proxy:latest" \
  --registry-server "$ACR_SERVER" \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --min-replicas 1 --max-replicas 2 \
  --cpu 0.25 --memory 0.5Gi \
  --ingress internal --target-port 3020 \
  --env-vars \
    "PORT=3020" \
    "PROXY_BASE_PATH=proxy" \
    "RESOURCES_ENDPOINT_URL=https://${SERVER_FQDN}/api/proxy/resources" \
    "ROLES_ENDPOINT_URL=https://${SERVER_FQDN}/api/proxy/roles" \
    "MAPINSTANCES_ENDPOINT_URL=https://${SERVER_FQDN}/api" \
    "API_ACCESS_TOKEN=${API_ACCESS_TOKEN}" \
    "WELL_KNOWN=${IDP_WELLKNOWN_URL}" \
    "TOKEN_URL=${IDP_TOKEN_URL}" \
    "CLIENT_ID=${IDP_CLIENT_ID}" \
    "CLIENT_SECRET=${IDP_CLIENT_SECRET}" \
    "SCOPE=${IDP_SCOPE}" \
    "HTTP_TIMEOUT=10000" \
    "SET_ACCESS_TOKEN_COOKIE=true" \
    "NODE_ENV=production" \
  -o none

# ==============================================================================
# 6. Deploy client
# ==============================================================================

echo ">>> Deploying client..."
az containerapp create --name client \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENV_NAME" \
  --image "${ACR_SERVER}/origo-admin-client:latest" \
  --registry-server "$ACR_SERVER" \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --min-replicas 1 --max-replicas 3 \
  --cpu 0.5 --memory 1.0Gi \
  --ingress external --target-port 3000 \
  --env-vars \
    "NEXT_PUBLIC_BASE_PATH=" \
    "BASE_URL=https://${SERVER_FQDN}/api/" \
    "NEXT_PUBLIC_PROXY_URL=api/proxy" \
    "VERSION=0.9.0" \
    "UPDATED=2024-09-01" \
    "LOGO=/img/admin_logo.png" \
    "LOGO_WIDTH=35" \
    "LOGO_HEIGHT=35" \
    "GITHUB_URL=https://github.com/haninge-geodata" \
    "PORT=3000" \
    "AUTH_ENABLED=${AUTH_ENABLED}" \
    "NEXTAUTH_SECRET=${TOKEN_SECRET}" \
    "PROTECTED_API_ACCESS_TOKEN=${API_ACCESS_TOKEN}" \
    "PROTECTED_IDP_WELL_KNOWN=${IDP_WELLKNOWN_URL}" \
    "PROTECTED_IDP_TOKEN_URL=${IDP_TOKEN_URL}" \
    "PROTECTED_IDP_CLIENT_ID=${IDP_CLIENT_ID}" \
    "PROTECTED_IDP_CLIENT_SECRET=${IDP_CLIENT_SECRET}" \
    "PROTECTED_IDP_SCOPE=${IDP_SCOPE}" \
    "PROTECTED_IDP_REDIRECT_URI=${IDP_REDIRECT_URI}" \
    "NODE_ENV=production" \
  -o none

CLIENT_FQDN=$(az containerapp show --name client --resource-group "$RESOURCE_GROUP" \
  --query "properties.configuration.ingress.fqdn" -o tsv)

# Update NEXTAUTH_URL to the actual public URL
az containerapp update --name client --resource-group "$RESOURCE_GROUP" \
  --set-env-vars "NEXTAUTH_URL=https://${CLIENT_FQDN}" -o none

# ==============================================================================
# Done
# ==============================================================================

echo ""
echo "=== Deploy complete ==="
echo ""
echo "  Client URL: https://${CLIENT_FQDN}"
echo "  Server:     https://${SERVER_FQDN} (internal)"
echo ""
echo "If API_ACCESS_TOKEN was empty, generate it now:"
echo "  az containerapp exec --name server --resource-group ${RESOURCE_GROUP} --command 'node dist/server/src/scripts/generateInitialToken.js'"
echo "Then update API_ACCESS_TOKEN in this script and run it again."
