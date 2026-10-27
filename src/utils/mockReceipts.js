// MOCK ONLY: pretends the server and the other people are updating a message.
// Delete this file when Socket.IO is connected and handle real events instead,
// e.g. "message:delivered" and "message:read".
export function scheduleMockReceipts(conversation, apply) {
  const timers = [];
  const at = (ms, patch) => timers.push(setTimeout(() => apply(patch), ms));

  at(600, { status: "delivered" });

  if (conversation.type === "dm") {
    // Only an active teammate "reads" it
    if (conversation.status === "active") at(2400, { status: "read" });
  } else {
    const people = conversation.participants ?? [];
    if (people.length) {
      at(2000, { status: "read", readBy: people.slice(0, 1) });
      at(4000, { readBy: people.slice(0, 2) });
    }
  }

  return () => timers.forEach(clearTimeout);
}