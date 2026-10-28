import test, { describe, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDB, clearTestDB, teardownTestDB } from "./setup.js";
import { User } from "../src/models/User.js";
import { Conversation } from "../src/models/Conversation.js";
import { signToken } from "../src/middleware/authMiddleware.js";

describe("Messages REST APIs, Pagination & Moderation", () => {
  let app;
  let user1, token1;
  let user2, token2;
  let user3, token3;
  let conversation;

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

    conversation = await Conversation.create({
      type: "channel",
      name: "general",
      memberIds: [user1._id, user2._id],
      adminIds: [user1._id],
    });
  });

  after(async () => {
    await teardownTestDB();
  });

  test("POST /api/conversations/:id/messages sends message and validates payload", async () => {
    // Valid text message
    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({
        body: "Hello team!",
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.message.body, "Hello team!");
    assert.equal(res.body.data.message.senderId.name, "User One");

    // Empty text without attachment must be rejected (400)
    const badRes = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({
        body: "   ",
        attachments: [],
      });

    assert.equal(badRes.status, 400);

    // Attachment-only message must be accepted
    const attachRes = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({
        body: "",
        attachments: [{ name: "doc.pdf", size: 1024, type: "application/pdf", url: "/uploads/doc.pdf" }],
      });

    assert.equal(attachRes.status, 201);
    assert.equal(attachRes.body.data.message.attachments.length, 1);
  });

  test("POST /api/conversations/:id/messages rejects non-members (403)", async () => {
    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token3}`)
      .send({
        body: "Trying to intrude!",
      });

    assert.equal(res.status, 403);
  });

  test("Idempotent message sending with clientTempId", async () => {
    const clientTempId = "temp-unique-uuid-1234";

    const res1 = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({
        body: "Idempotent message",
        clientTempId,
      });

    assert.equal(res1.status, 201);
    const msgId = res1.body.data.message.id;

    // Retry sending with exact same clientTempId
    const res2 = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({
        body: "Idempotent message",
        clientTempId,
      });

    assert.equal(res2.status, 200);
    assert.equal(res2.body.data.isDuplicate, true);
    assert.equal(res2.body.data.message.id, msgId);
  });

  test("GET /api/conversations/:id/messages cursor-based pagination", async () => {
    // Insert 5 messages with distinct timestamps
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post(`/api/conversations/${conversation._id}/messages`)
        .set("Authorization", `Bearer ${token1}`)
        .send({
          body: `Message ${i}`,
        });
      // Small delay for clean monotonic timestamps
      await new Promise((r) => setTimeout(r, 20));
    }

    // Page 1: limit 2
    const page1 = await request(app)
      .get(`/api/conversations/${conversation._id}/messages?limit=2`)
      .set("Authorization", `Bearer ${token1}`);

    assert.equal(page1.status, 200);
    assert.equal(page1.body.data.messages.length, 2);
    assert.equal(page1.body.data.hasMore, true);
    assert.ok(page1.body.data.nextCursor);
    assert.equal(page1.body.data.messages[0].body, "Message 5");
    assert.equal(page1.body.data.messages[1].body, "Message 4");

    // Page 2 using nextCursor: limit 2
    const page2 = await request(app)
      .get(`/api/conversations/${conversation._id}/messages?limit=2&cursor=${page1.body.data.nextCursor}`)
      .set("Authorization", `Bearer ${token1}`);

    assert.equal(page2.status, 200);
    assert.equal(page2.body.data.messages.length, 2);
    assert.equal(page2.body.data.hasMore, true);
    assert.equal(page2.body.data.messages[0].body, "Message 3");
    assert.equal(page2.body.data.messages[1].body, "Message 2");

    // Page 3: final message
    const page3 = await request(app)
      .get(`/api/conversations/${conversation._id}/messages?limit=2&cursor=${page2.body.data.nextCursor}`)
      .set("Authorization", `Bearer ${token1}`);

    assert.equal(page3.status, 200);
    assert.equal(page3.body.data.messages.length, 1);
    assert.equal(page3.body.data.hasMore, false);
    assert.equal(page3.body.data.messages[0].body, "Message 1");
  });

  test("PATCH and DELETE message permissions (author vs non-author)", async () => {
    const sendRes = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({
        body: "Original Message Text",
      });

    const msgId = sendRes.body.data.message.id;

    // Non-author (User 2) cannot edit (403)
    const badEdit = await request(app)
      .patch(`/api/messages/${msgId}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ body: "Tampered Text" });

    assert.equal(badEdit.status, 403);

    // Author (User 1) can edit
    const goodEdit = await request(app)
      .patch(`/api/messages/${msgId}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({ body: "Updated Message Text" });

    assert.equal(goodEdit.status, 200);
    assert.equal(goodEdit.body.data.message.body, "Updated Message Text");
    assert.ok(goodEdit.body.data.message.editedAt);

    // Author can soft-delete
    const delRes = await request(app)
      .delete(`/api/messages/${msgId}`)
      .set("Authorization", `Bearer ${token1}`);

    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.data.deleted, true);

    // Message is now soft deleted and omitted from active message list
    const listRes = await request(app)
      .get(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`);

    assert.equal(listRes.body.data.messages.length, 0);
  });

  test("Message search scoped to conversation", async () => {
    await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({ body: "Unique keyword apple pie" });

    await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({ body: "Different keyword banana split" });

    const searchRes = await request(app)
      .get(`/api/conversations/${conversation._id}/messages/search?q=apple`)
      .set("Authorization", `Bearer ${token1}`);

    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.body.data.messages.length, 1);
    assert.equal(searchRes.body.data.messages[0].body, "Unique keyword apple pie");
  });

  test("POST /api/messages/:id/reactions toggles reaction emoji", async () => {
    const sendRes = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${token1}`)
      .send({ body: "React to this!" });

    const msgId = sendRes.body.data.message.id;

    // Toggle ON
    const reactRes1 = await request(app)
      .post(`/api/messages/${msgId}/reactions`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ emoji: "👍" });

    assert.equal(reactRes1.status, 200);
    assert.equal(reactRes1.body.data.message.reactions.length, 1);
    assert.equal(reactRes1.body.data.message.reactions[0].emoji, "👍");
    assert.equal(reactRes1.body.data.message.reactions[0].users.length, 1);

    // Toggle OFF
    const reactRes2 = await request(app)
      .post(`/api/messages/${msgId}/reactions`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ emoji: "👍" });

    assert.equal(reactRes2.status, 200);
    assert.equal(reactRes2.body.data.message.reactions.length, 0);
  });
});
