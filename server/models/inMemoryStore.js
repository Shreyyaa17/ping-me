import bcrypt from 'bcryptjs';

const defaultPasswordHash = bcrypt.hashSync('12345678', 10);

const initialUsers = [
  {
    _id: "680f50aaf10f3cd28382ecf2",
    email: "alison@pingme.dev",
    fullName: "Alison Martin",
    password: defaultPasswordHash,
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Hi Everyone, I am Using PingMe",
    createdAt: new Date("2025-01-01T10:00:00Z"),
  },
  {
    _id: "680f50e4f10f3cd28382ecf9",
    email: "martin@pingme.dev",
    fullName: "Martin Johnson",
    password: defaultPasswordHash,
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Hey there! Ready to chat.",
    createdAt: new Date("2025-01-02T10:00:00Z"),
  },
  {
    _id: "680f510af10f3cd28382ed01",
    email: "enrique@pingme.dev",
    fullName: "Enrique Martinez",
    password: defaultPasswordHash,
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Ping me anytime!",
    createdAt: new Date("2025-01-03T10:00:00Z"),
  },
  {
    _id: "680f5137f10f3cd28382ed10",
    email: "marco@pingme.dev",
    fullName: "Marco Jones",
    password: defaultPasswordHash,
    profilePicture: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    bio: "Coding & chatting.",
    createdAt: new Date("2025-01-04T10:00:00Z"),
  },
  {
    _id: "680f516cf10f3cd28382ed11",
    email: "richard@pingme.dev",
    fullName: "Richard Smith",
    password: defaultPasswordHash,
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    bio: "Online and available.",
    createdAt: new Date("2025-01-05T10:00:00Z"),
  }
];

const initialMessages = [
  {
    _id: "msg_init_1",
    senderId: "680f50aaf10f3cd28382ecf2",
    receiverId: "680f50e4f10f3cd28382ecf9",
    text: "Hey Martin! How are you doing today?",
    image: null,
    seen: true,
    createdAt: new Date("2025-01-02T10:05:00Z").toISOString()
  },
  {
    _id: "msg_init_2",
    senderId: "680f50e4f10f3cd28382ecf9",
    receiverId: "680f50aaf10f3cd28382ecf2",
    text: "Doing great Alison! PingMe looks awesome.",
    image: null,
    seen: true,
    createdAt: new Date("2025-01-02T10:06:00Z").toISOString()
  }
];

class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.messages = [];

    initialUsers.forEach(u => this.users.set(u._id, { ...u }));
    initialMessages.forEach(m => this.messages.push({ ...m }));
  }

  generateId() {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  stripPassword(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // USER OPERATIONS
  async findOneUser(query) {
    let found = null;
    if (query.email) {
      for (const u of this.users.values()) {
        if (u.email.toLowerCase() === query.email.toLowerCase()) {
          found = { ...u };
          break;
        }
      }
    } else if (query._id) {
      const u = this.users.get(query._id);
      if (u) found = { ...u };
    }
    return found;
  }

  async findUserById(id) {
    const u = this.users.get(String(id));
    return u ? { ...u } : null;
  }

  async createUser(userData) {
    const _id = this.generateId();
    const newUser = {
      _id,
      email: userData.email,
      fullName: userData.fullName,
      password: userData.password,
      bio: userData.bio || '',
      profilePicture: userData.profilePicture || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(_id, newUser);
    return { ...newUser };
  }

  async updateUserById(id, update) {
    const u = this.users.get(String(id));
    if (!u) return null;
    const updated = {
      ...u,
      ...update,
      updatedAt: new Date()
    };
    this.users.set(String(id), updated);
    return { ...updated };
  }

  async findUsers(query = {}) {
    let list = Array.from(this.users.values());
    if (query._id && query._id.$ne) {
      const neId = String(query._id.$ne);
      list = list.filter(u => String(u._id) !== neId);
    }
    return list.map(u => ({ ...u }));
  }

  // MESSAGE OPERATIONS
  async findMessages(query = {}) {
    let list = [...this.messages];

    if (query.$or && Array.isArray(query.$or)) {
      list = list.filter(m => {
        return query.$or.some(cond => {
          const senderMatch = String(m.senderId) === String(cond.senderId);
          const receiverMatch = String(m.receiverId) === String(cond.receiverId);
          return senderMatch && receiverMatch;
        });
      });
    }

    return list.map(m => ({ ...m }));
  }

  async countMessages(query = {}) {
    let count = 0;
    for (const m of this.messages) {
      let match = true;
      if (query.senderId && String(m.senderId) !== String(query.senderId)) match = false;
      if (query.receiverId && String(m.receiverId) !== String(query.receiverId)) match = false;
      if (typeof query.seen === 'boolean' && m.seen !== query.seen) match = false;
      if (match) count++;
    }
    return count;
  }

  async updateManyMessages(query = {}, update = {}) {
    let modifiedCount = 0;
    for (const m of this.messages) {
      let match = true;
      if (query.$or && Array.isArray(query.$or)) {
        match = query.$or.some(cond => {
          let cMatch = true;
          if (cond._id && String(m._id) !== String(cond._id)) cMatch = false;
          if (cond.senderId && String(m.senderId) !== String(cond.senderId)) cMatch = false;
          if (cond.receiverId && String(m.receiverId) !== String(cond.receiverId)) cMatch = false;
          if (typeof cond.seen === 'boolean' && m.seen !== cond.seen) cMatch = false;
          return cMatch;
        });
      } else {
        if (query._id && String(m._id) !== String(query._id)) match = false;
        if (query.senderId && String(m.senderId) !== String(query.senderId)) match = false;
        if (query.receiverId && String(m.receiverId) !== String(query.receiverId)) match = false;
        if (typeof query.seen === 'boolean' && m.seen !== query.seen) match = false;
      }
      if (match) {
        Object.assign(m, update);
        modifiedCount++;
      }
    }
    return { modifiedCount };
  }

  createMessageSync(msgData) {
    const _id = this.generateId();
    const newMsg = {
      _id,
      text: msgData.text || '',
      image: msgData.image || null,
      senderId: String(msgData.senderId),
      receiverId: String(msgData.receiverId),
      seen: msgData.seen ?? false,
      createdAt: new Date().toISOString()
    };
    this.messages.push(newMsg);
    return { ...newMsg };
  }

  async createMessage(msgData) {
    return this.createMessageSync(msgData);
  }
}

export const inMemoryStore = new InMemoryStore();
