var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "origoadmin_client",
  description: "Origo Admin Client; port 3000 (NextJS)",
  script: "{ABSOLUTE_PATH_TO_Client}\\server.js",
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("uninstall", function () {
  console.info("Uninstall complete.");
  console.info("The service exists: ", svc.exists);
});

// Uninstall the service.
svc.uninstall();
