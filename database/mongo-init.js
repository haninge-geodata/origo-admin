db = db.getSiblingDB("origoadmin-test");
print("Skapar användare i origoadmin-test databas...");
db.createUser({
  user: "root",
  pwd: "BYT UT MIG",
  roles: [
    {
      role: "readWrite",
      db: "origoadmin-test",
    },
  ],
});
print("Användare 'root' skapad i databasen 'origoadin-test'.");
