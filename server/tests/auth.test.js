import test, { describe, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDB, clearTestDB, teardownTestDB } from "./setup.js";
import { User } from "../src/models/User.js";

describe("Authentication & Authorization REST APIs", () => {
  let app;

  before(async () => {
    await setupTestDB();
    app = createApp();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  test("POST /api/auth/register creates user and issues JWT", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Alice Walker",
        email: "alice@example.com",
        password: "securePassword123!",
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, "alice@example.com");
    assert.equal(res.body.data.user.name, "Alice Walker");
    assert.equal(res.body.data.user.passwordHash, undefined, "passwordHash must never be exposed");

    // Verify database record has hashed password
    const inDb = await User.findOne({ email: "alice@example.com" }).select("+passwordHash");
    assert.ok(inDb);
    assert.notEqual(inDb.passwordHash, "securePassword123!");
    assert.ok(inDb.passwordHash.startsWith("$2"));
  });

  test("POST /api/auth/register rejects duplicate email with 409", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Alice Walker",
        email: "alice@example.com",
        password: "securePassword123!",
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Alice Clone",
        email: "alice@example.com",
        password: "anotherPassword123!",
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, "DUPLICATE_EMAIL");
  });

  test("POST /api/auth/register rejects invalid inputs with 400", async () => {
    // Short password
    const res1 = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Bob",
        email: "bob@example.com",
        password: "short",
      });
    assert.equal(res1.status, 400);

    // Invalid email
    const res2 = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Bob",
        email: "not-an-email",
        password: "password123!",
      });
    assert.equal(res2.status, 400);
  });

  test("POST /api/auth/login validates credentials and issues JWT", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Charlie Brown",
        email: "charlie@example.com",
        password: "charliePassword123!",
      });

    // Valid login
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "charlie@example.com",
        password: "charliePassword123!",
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.name, "Charlie Brown");

    // Invalid password
    const resBadPass = await request(app)
      .post("/api/auth/login")
      .send({
        email: "charlie@example.com",
        password: "wrongPassword!",
      });
    assert.equal(resBadPass.status, 401);
    assert.equal(resBadPass.body.error.code, "INVALID_CREDENTIALS");

    // Non-existent user
    const resNotFound = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nobody@example.com",
        password: "password123!",
      });
    assert.equal(resNotFound.status, 401);
  });

  test("GET /api/auth/me returns profile for valid JWT and 401 without", async () => {
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Diana Prince",
        email: "diana@example.com",
        password: "wonderPassword123!",
      });

    const token = regRes.body.data.token;

    // Authorized request
    const authRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(authRes.status, 200);
    assert.equal(authRes.body.data.user.name, "Diana Prince");

    // Unauthorized request
    const noTokenRes = await request(app).get("/api/auth/me");
    assert.equal(noTokenRes.status, 401);

    // Invalid token
    const badTokenRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-garbage-token");
    assert.equal(badTokenRes.status, 401);
  });
});
