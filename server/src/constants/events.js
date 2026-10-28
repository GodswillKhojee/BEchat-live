export const SocketEvents = {
  // Client -> Server
  JOIN_CONVERSATION: "conversation:join",
  LEAVE_CONVERSATION: "conversation:leave",
  SEND_MESSAGE: "message:send",
  START_TYPING: "typing:start",
  STOP_TYPING: "typing:stop",
  READ_MESSAGES: "message:read",
  REACT_MESSAGE: "message:react",
  UPDATE_PRESENCE: "presence:update",

  // Server -> Room / Client
  NEW_MESSAGE: "message:new",
  USER_TYPING: "user:typing",
  READ_RECEIPT: "message:receipt",
  REACTION_UPDATED: "reaction:update",
  PRESENCE_CHANGED: "presence:changed",
  ERROR: "socket:error",
};
