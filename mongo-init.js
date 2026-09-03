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
    firstName: "Admin",
    lastName: "Admin",
    email: "admin@test.com",
    password: "$2a$12$wCuwAPFZrnmX64qN.Nx7c.brXdn3Zj5hAkTTbdlVcymBHj87xqDYO",
    role: "admin",
    team: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
if (!db.users.findOne({ email: "manager@test.com" })) {
  db.users.insertOne({
    id: crypto.randomUUID(),
    firstName: "Manager",
    lastName: "Manager",
    email: "manager@test.com",
    password: "$2a$12$wCuwAPFZrnmX64qN.Nx7c.brXdn3Zj5hAkTTbdlVcymBHj87xqDYO",
    role: "manager",
    team: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
if (!db.users.findOne({ email: "johndoe@test.com" })) {
  db.users.insertOne({
    id: crypto.randomUUID(),
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@test.com",
    password: "$2a$12$wCuwAPFZrnmX64qN.Nx7c.brXdn3Zj5hAkTTbdlVcymBHj87xqDYO",
    role: "coworker",
    team: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
if (!db.users.findOne({ email: "janedoe@test.com" })) {
  db.users.insertOne({
    id: crypto.randomUUID(),
    firstName: "Jane",
    lastName: "Doe",
    email: "janedoe@test.com",
    password: "$2a$12$wCuwAPFZrnmX64qN.Nx7c.brXdn3Zj5hAkTTbdlVcymBHj87xqDYO",
    role: "coworker",
    team: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
