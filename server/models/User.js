import mongoose from "mongoose";
import { isDBConnected } from "../lib/db.js";
import { inMemoryStore } from "./inMemoryStore.js";

const userSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, "Invalid email format"]},
  fullName: {type: String, required: true},
  password: {type: String, required: true, minlength: 8},
  profilePicture: {type: String, default: ""},
  bio: {type: String},
}, {timestamps: true});

const MongooseUser = mongoose.models.User || mongoose.model("User", userSchema);

const chainable = (resPromise) => {
  resPromise.select = (fields) => {
    return resPromise.then(res => {
      if (!res) return null;
      if (Array.isArray(res)) {
        return res.map(item => {
          if (typeof fields === 'string' && fields.includes('-password')) {
            const { password, ...rest } = item;
            return rest;
          }
          return item;
        });
      }
      if (typeof fields === 'string' && fields.includes('-password')) {
        const { password, ...rest } = res;
        return rest;
      }
      return res;
    });
  };
  return resPromise;
};

const User = {
  findOne: (query) => {
    if (isDBConnected()) {
      return MongooseUser.findOne(query);
    }
    return chainable(inMemoryStore.findOneUser(query));
  },
  findById: (id) => {
    if (isDBConnected()) {
      return MongooseUser.findById(id);
    }
    return chainable(inMemoryStore.findUserById(id));
  },
  find: (query) => {
    if (isDBConnected()) {
      return MongooseUser.find(query);
    }
    return chainable(inMemoryStore.findUsers(query));
  },
  create: async (data) => {
    if (isDBConnected()) {
      return await MongooseUser.create(data);
    }
    return await inMemoryStore.createUser(data);
  },
  findByIdAndUpdate: async (id, update, options) => {
    if (isDBConnected()) {
      return await MongooseUser.findByIdAndUpdate(id, update, options);
    }
    return await inMemoryStore.updateUserById(id, update);
  }
};

export default User;
