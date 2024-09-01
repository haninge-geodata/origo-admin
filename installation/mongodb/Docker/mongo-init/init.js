db = db.getSiblingDB("origoadmin");
db.createUser({
  user: "admin",
  pwd: "adminpassword", // Ange ditt lösenord här
  roles: [
    {
      role: "readWrite",
      db: "origoadmin",
    },
  ],
});
