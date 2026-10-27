// MOCK DATA: replace with API data (GET /conversations) and Socket.IO events later.
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000);

const theirs = (id, author, avatar, text, mins) => ({
  id, mine: false, author, avatar, text, at: minutesAgo(mins),
});
const mine = (id, text, mins) => ({
  id, mine: true, author: "You", avatar: null, text, at: minutesAgo(mins),
});

export const mockConversations = [
  {
    id: "general",
    type: "channel",
    name: "general",
    members: 12,
    unread: 3,
    messages: [
      theirs("g1", "Maya Chen", "female", "Morning everyone! Stand-up starts in 10 minutes.", 95),
      theirs("g2", "Jordan Lee", "male", "I'll be a couple of minutes late, start without me.", 92),
      mine("g3", "No problem, I'll share the notes afterwards.", 90),
      theirs("g4", "Maya Chen", "female", "Reminder: the release branch freezes at 5 PM today.", 12),
      theirs("g5", "Maya Chen", "female", "Please get your pull requests in before then.", 11),
      theirs("g6", "Jordan Lee", "male", "On it.", 4),
    ],
  },
  {
    id: "maya",
    type: "dm",
    name: "Maya Chen",
    avatar: "female",
    status: "active",
    unread: 1,
    messages: [
      mine("m1", "Did you get a chance to look at the new profile page?", 140),
      theirs("m2", "Maya Chen", "female", "Yes! The avatar picker looks great.", 130),
      theirs("m3", "Maya Chen", "female", "Can we make the status dots a bit bigger?", 25),
    ],
  },
  {
    id: "design",
    type: "channel",
    name: "design-team",
    members: 5,
    unread: 0,
    messages: [
      theirs("d1", "Jordan Lee", "male", "Uploaded the new palette to the shared board.", 60 * 20),
      mine("d2", "Looks good. I'll apply it to the chat screens.", 60 * 19),
    ],
  },
  {
    id: "jordan",
    type: "dm",
    name: "Jordan Lee",
    avatar: "male",
    status: "away",
    unread: 0,
    messages: [
      theirs("j1", "Jordan Lee", "male", "Can you review my pull request when you have a moment?", 60 * 50),
      mine("j2", "Sure, I'll take a look this afternoon.", 60 * 49),
    ],
  },
  {
    id: "chris",
    type: "dm",
    name: "Chris Patel",
    avatar: "male",
    status: "dnd",
    unread: 0,
    messages: [
      mine("c1", "Thanks for the help with the API design!", 60 * 24 * 9),
      theirs("c2", "Chris Patel", "male", "Anytime.", 60 * 24 * 9 - 5),
    ],
  },
];