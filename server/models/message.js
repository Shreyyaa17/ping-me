import mongoose from "mongoose";
import { isDBConnected } from "../lib/db.js";
import { inMemoryStore } from "./inMemoryStore.js";

const messageSchema = new mongoose.Schema({
  senderId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  receiverId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  text: {type: String},
  image: {type: String},
  seen: {type: Boolean, default: false},
}, {timestamps: true});

const MongooseMessage = mongoose.models.Message || mongoose.model("Message", messageSchema, "messages");

const chainable = (resPromise) => {
  resPromise.sort = (sortRule) => {
    return resPromise.then(res => {
      if (!Array.isArray(res)) return res;
      return [...res].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
  };
  return resPromise;
};

const Message = {
  find: (query) => {
    if (isDBConnected()) {
      return MongooseMessage.find(query);
    }
    return chainable(inMemoryStore.findMessages(query));
  },
  countDocuments: async (query) => {
    if (isDBConnected()) {
      return await MongooseMessage.countDocuments(query);
    }
    return await inMemoryStore.countMessages(query);
  },
  updateMany: async (query, update) => {
    if (isDBConnected()) {
      return await MongooseMessage.updateMany(query, update);
    }
    return await inMemoryStore.updateManyMessages(query, update);
  },
  create: async (data) => {
    if (isDBConnected()) {
      return await MongooseMessage.create(data);
    }
    return await inMemoryStore.createMessage(data);
  }
};

export default Message;
