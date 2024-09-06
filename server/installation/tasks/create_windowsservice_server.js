var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "origoadmin_server",
  description: "Origo Admin Server; port 3010 (NodeJS)",
  script: "{ABSOLUTE_PATH_TO_Client}\\server.js",
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", function () {
  svc.start();
});

// Listen for the "start" event, which is fired
// when the new service is started.
svc.on("start", function () {
  console.info("Service was started.");
});

svc.install();
