import test, { describe, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import http from "http";
import { io as Client } from "socket.io-client";
import { createApp } from "../src/app.js";
import { initSocketServer } from "../src/sockets/socketServer.js";
import { setupTestDB, clearTestDB, teardownTestDB } from "./setup.js";
import { User } from "../src/models/User.js";
import { Conversation } from "../src/models/Conversation.js";
import { signToken } from "../src/middleware/authMiddleware.js";

describe("Socket.IO Real-Time Engine & Handshake Auth", () => {
  let httpServer;
  let io;
  let port;
  let user1, token1;
  let user2, token2;
  let user3, token3;
  let conversation;

  before(async () => {
    await setupTestDB();
    const app = createApp();
    httpServer = http.createServer(app);
    io = initSocketServer(httpServer);
    app.set("io", io);

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    await clearTestDB();

    user1 = await User.create({
      name: "Socket User 1",
      email: "sock1@example.com",
      passwordHash: await User.hashPassword("password123!"),
    });
    token1 = signToken(user1);

    user2 = await User.create({
      name: "Socket User 2",
      email: "sock2@example.com",
      passwordHash: await User.hashPassword("password123!"),
    });
    token2 = signToken(user2);

    user3 = await User.create({
      name: "Socket User 3",
      email: "sock3@example.com",
      passwordHash: await User.hashPassword("password123!"),
    });
    token3 = signToken(user3);

    conversation = await Conversation.create({
      type: "channel",
      name: "socket-test-channel",
      memberIds: [user1._id, user2._id],
      adminIds: [user1._id],
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      httpServer.close(() => resolve());
    });
    await teardownTestDB();
  });

  test("Socket handshake rejects unauthenticated connection", async () => {
    const client = Client(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ["websocket"],
      auth: {}, // Missing token
    });

    const error = await new Promise((resolve) => {
      client.on("connect_error", (err) => {
        resolve(err.message);
        client.disconnect();
      });
    });

    assert.equal(error, "AUTHENTICATION_REQUIRED");
  });

  test("Socket handshake accepts connection with valid JWT", async () => {
    const client = Client(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ["websocket"],
      auth: { token: `Bearer ${token1}` },
    });

    const connected = await new Promise((resolve) => {
      client.on("connect", () => {
        resolve(true);
        client.disconnect();
      });
    });

    assert.equal(connected, true);
  });

  test("Socket room join enforces conversation membership", async () => {
    const client1 = Client(`http://localhost:${port}`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token1}` },
    });

    const client3 = Client(`http://localhost:${port}`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token3}` },
    });

    await Promise.all([
      new Promise((r) => client1.on("connect", r)),
      new Promise((r) => client3.on("connect", r)),
    ]);

    // Member (client1) joins room successfully
    const joinResult1 = await new Promise((resolve) => {
      client1.emit("conversation:join", { conversationId: conversation._id.toString() }, resolve);
    });
    assert.equal(joinResult1.success, true);

    // Non-member (client3) is rejected from joining room
    const joinResult3 = await new Promise((resolve) => {
      client3.emit("conversation:join", { conversationId: conversation._id.toString() }, resolve);
    });
    assert.equal(joinResult3.success, false);
    assert.match(joinResult3.error, /Access denied/);

    client1.disconnect();
    client3.disconnect();
  });

  test("Live message delivery across room peers", async () => {
    const sender = Client(`http://localhost:${port}`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token1}` },
    });

    const receiver = Client(`http://localhost:${port}`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token2}` },
    });

    await Promise.all([
      new Promise((r) => sender.on("connect", r)),
      new Promise((r) => receiver.on("connect", r)),
    ]);

    // Both join conversation room
    await new Promise((r) => sender.emit("conversation:join", { conversationId: conversation._id.toString() }, r));
    await new Promise((r) => receiver.emit("conversation:join", { conversationId: conversation._id.toString() }, r));

    // Receiver listens for new message
    const messagePromise = new Promise((resolve) => {
      receiver.on("message:new", (msg) => {
        resolve(msg);
      });
    });

    // Sender emits message:send
    const ack = await new Promise((resolve) => {
      sender.emit(
        "message:send",
        {
          conversationId: conversation._id.toString(),
          body: "Hello from real-time socket!",
        },
        resolve
      );
    });

    assert.equal(ack.success, true);
    assert.equal(ack.message.body, "Hello from real-time socket!");

    const receivedMessage = await messagePromise;
    assert.equal(receivedMessage.body, "Hello from real-time socket!");
    assert.equal(receivedMessage.senderId.name, "Socket User 1");

    sender.disconnect();
    receiver.disconnect();
  });

  test("Socket deduplication prevents duplicate insert with clientTempId", async () => {
    const client = Client(`http://localhost:${port}`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token1}` },
    });

    await new Promise((r) => client.on("connect", r));
    await new Promise((r) => client.emit("conversation:join", { conversationId: conversation._id.toString() }, r));

    const clientTempId = "temp-socket-dedup-xyz";

    // First send
    const ack1 = await new Promise((resolve) => {
      client.emit(
        "message:send",
        {
          conversationId: conversation._id.toString(),
          body: "Socket dedup test",
          clientTempId,
        },
        resolve
      );
    });

    assert.equal(ack1.success, true);
    assert.equal(ack1.isDuplicate, undefined);

    // Re-send with same clientTempId
    const ack2 = await new Promise((resolve) => {
      client.emit(
        "message:send",
        {
          conversationId: conversation._id.toString(),
          body: "Socket dedup test",
          clientTempId,
        },
        resolve
      );
    });

    assert.equal(ack2.success, true);
    assert.equal(ack2.isDuplicate, true);
    assert.equal(ack2.message.id, ack1.message.id);

    client.disconnect();
  });
});
