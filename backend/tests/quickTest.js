const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
process.env.JWT_SECRET = "test-jwt-secret-key-12345";
process.env.JWT_EXPIRE = "7d";

async function run() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const app = require("./testApp");

  const res = await request(app).post("/api/auth/register").send({
    name: "Ravi Kumar",
    email: "farmer@test.com",
    password: "password123",
    phone: "9876543210",
    role: "farmer",
    address: { street: "Farm Road 1", city: "Vellore", state: "Tamil Nadu", pincode: "632001" },
    farmDetails: { farmName: "Ravi Organic Farm", farmSize: "5 acres" },
  });
  console.log("STATUS:", res.status);
  if (res.status === 201) {
    console.log("OK, token exists:", !!res.body.data.token);
  } else {
    console.log("ERROR:", res.body.message);
  }

  await mongoose.disconnect();
  await mongo.stop();
}
run().catch(console.error);
