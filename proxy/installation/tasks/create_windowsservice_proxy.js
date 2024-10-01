var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "origoadmin_proxy",
  description: "Origo Admin Proxy; port 3020 (NodeJS)",
  script: "{ABSOLUTE_PATH_TO_PROXY}\\dist\\server.js",
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", function () {
  svc.start();
});

svc.install();
