import test, { describe, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDB, clearTestDB, teardownTestDB } from "./setup.js";
import { User } from "../src/models/User.js";
import { signToken } from "../src/middleware/authMiddleware.js";

describe("Conversations REST APIs & Authorization", () => {
  let app;
  let user1, token1;
  let user2, token2;
  let user3, token3;

  before(async () => {
    await setupTestDB();
    app = createApp();
  });

  beforeEach(async () => {
    await clearTestDB();

    user1 = await User.create({
      name: "User One",
      email: "user1@example.com",
      passwordHash: await User.hashPassword("password123!"),
    });
    token1 = signToken(user1);

    user2 = await User.create({
      name: "User Two",
      email: "user2@example.com",
      passwordHash: await User.hashPassword("password123!"),
    });
    token2 = signToken(user2);

    user3 = await User.create({
      name: "User Three",
      email: "user3@example.com",
      passwordHash: await User.hashPassword("password123!"),
    });
    token3 = signToken(user3);
  });

  after(async () => {
    await teardownTestDB();
  });

  test("POST /api/conversations creates a group channel", async () => {
    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        type: "channel",
        name: "engineering",
        memberIds: [user2._id.toString()],
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.conversation.name, "engineering");
    assert.equal(res.body.data.conversation.type, "channel");
    // Creator is automatically member and admin
    assert.equal(res.body.data.conversation.memberIds.length, 2);
  });

  test("POST /api/conversations creates DM and guarantees uniqueness between pair", async () => {
    // User1 creates DM with User2
    const res1 = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        type: "dm",
        recipientId: user2._id.toString(),
      });

    assert.equal(res1.status, 201);
    const convId = res1.body.data.conversation.id;

    // User2 attempts to create DM with User1 -> should return existing DM (idempotent)
    const res2 = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        type: "dm",
        recipientId: user1._id.toString(),
      });

    assert.equal(res2.status, 200);
    assert.equal(res2.body.data.isExisting, true);
    assert.equal(res2.body.data.conversation.id, convId, "Must return the same DM conversation");
  });

  test("GET /api/conversations/:id blocks non-members with 403 Forbidden", async () => {
    // User1 and User2 share a conversation
    const createRes = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        type: "dm",
        recipientId: user2._id.toString(),
      });

    const convId = createRes.body.data.conversation.id;

    // User3 (non-member) tries to view it
    const forbiddenRes = await request(app)
      .get(`/api/conversations/${convId}`)
      .set("Authorization", `Bearer ${token3}`);

    assert.equal(forbiddenRes.status, 403);
    assert.equal(forbiddenRes.body.error.code, "FORBIDDEN");

    // Member (User1) can view it
    const allowedRes = await request(app)
      .get(`/api/conversations/${convId}`)
      .set("Authorization", `Bearer ${token1}`);

    assert.equal(allowedRes.status, 200);
    assert.equal(allowedRes.body.data.conversation.id, convId);
  });

  test("GET /api/conversations lists only conversations where user is a member", async () => {
    // Conv A: user1 + user2
    await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        type: "dm",
        recipientId: user2._id.toString(),
      });

    // Conv B: user2 + user3
    await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        type: "dm",
        recipientId: user3._id.toString(),
      });

    // User1 should only see 1 conversation
    const resUser1 = await request(app)
      .get("/api/conversations")
      .set("Authorization", `Bearer ${token1}`);

    assert.equal(resUser1.status, 200);
    assert.equal(resUser1.body.data.conversations.length, 1);

    // User2 is in both, so should see 2
    const resUser2 = await request(app)
      .get("/api/conversations")
      .set("Authorization", `Bearer ${token2}`);

    assert.equal(resUser2.status, 200);
    assert.equal(resUser2.body.data.conversations.length, 2);
  });
});
