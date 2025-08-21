var crypto = require("crypto");

db = db.getSiblingDB("office-trackr");
db.createUser({
  user: "officetrackruser",
  pwd: "officetrackrpass",
  roles: [{ role: "readWrite", db: "office-trackr" }],
});

if (!db.users.findOne({ email: "admin@admin.com" })) {
  db.users.insertOne({
    id: crypto.randomUUID(),
    name: "admin",
    email: "admin@admin.com",
    password: "$2b$12$uoxz.9Xc9pGhHSo6dvgbtOs5KtYtJY07vYhUp7Mv0y8gO6aTzWzda",
    role: "admin",
    team: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
