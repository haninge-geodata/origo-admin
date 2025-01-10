# Origo Admin

## Getting started

### Using Docker Compose

#### Prerequisites

1. Install Docker and Docker Compose
2. Copy `.env.example` to `.env`

#### Build the images

3. Run `docker-compose build`

Next, you either need to provide your own OIDC-compliant IdP or use the provided Authentik IdP for testing.

#### IdP for testing

4. Run `docker-compose up -d idp idp-worker`
5. Go to `http://localhost:3050/if/flow/initial-setup/` and enter an email and password of your own choosing
6. Open the "Admin interface", navigate to "Applications" and click "Create with Wizard"
7. Enter "Origo Admin" as name and "origo-admin" as slug, go to the next page and select the OIDC provider
8. Choose Next and select the implicit authorization flow, select "Public" as client type and add a redirect URI of type Regex and value `.*`
9. Scroll down to "Advanced protocol settings" and choose "Subject mode" as "Based on User's username"
10. Finally click "Submit"
11. Copy the given client ID and set it in `.env`

#### Own IdP

4. Adjust `.env` to match your IdP configuration

#### Origo Admin

12. Run `npm --prefix server/ run generate-secret-key`
13. Copy `.env.example` to `.env` and update the values, use the `TOKEN_SECRET` from the command above.
14. Run `docker-compose up -d server`
15. Run `docker-compose exec server node dist/server/src/scripts/generateInitialToken.js` and set the `API_ACCESS_TOKEN` in `.env`
16. Run `docker-compose exec mongodb mongosh mongodb://root:password@localhost/origoadmin?authSource=admin --eval 'db.getCollection("roles").insertOne({actors: [{"name": "akadmin", "type": "User"}], permissions: [], role: "Administratör"})'`
    * `akadmin` assumes you are using Authentik in its default configuration
17. Run `docker-compose up -d client proxy`
18. Visit `http://localhost:3000`
