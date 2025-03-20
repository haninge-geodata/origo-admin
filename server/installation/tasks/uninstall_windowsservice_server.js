var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "origoadmin_server",
  description: "Origo Admin Server; port 3010 (NodeJS)",
  script: "{ABSOLUTE_PATH_TO_Client}\\server.js",
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("uninstall", function () {
  console.info(`[${Date.now()}] Uninstall complete.`);
  console.info(`[${Date.now()}] The service exists: `, svc.exists);
});

// Uninstall the service.
svc.uninstall();
