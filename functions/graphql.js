const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const serverless = require("serverless-http");
const connectDB = require("./db");
const { ObjectId } = require("mongodb");

const typeDefs = gql`
  type Note {
    _id: ID!
    title: String!
    content: String!
  }

  type Query {
    notes: [Note]
    note(id: ID!): Note
  }

  type Mutation {
    createNote(title: String!, content: String!): Note
    updateNote(id: ID!, title: String, content: String): Note
    deleteNote(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    notes: async () => {
      const db = await connectDB();
      return db.find({}).toArray();
    },
    note: async (_, { id }) => {
      const db = await connectDB();
      return db.findOne({ _id: new ObjectId(id) });
    }
  },
  Mutation: {
    createNote: async (_, { title, content }) => {
      const db = await connectDB();
      const result = await db.insertOne({ title, content });
      return { _id: result.insertedId, title, content };
    },
    updateNote: async (_, { id, title, content }) => {
      const db = await connectDB();
      const result = await db.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { title, content } },
        { returnDocument: "after" }
      );
      return result.value;
    },
    deleteNote: async (_, { id }) => {
      const db = await connectDB();
      const result = await db.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    }
  }
};

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ event }) => ({ event })
});

let handler; // кешований handler

const startServer = async () => {
  if (!handler) {
    await server.start();
    server.applyMiddleware({ app });
    handler = serverless(app);
  }
  return handler;
};

exports.handler = async (event, context) => {
  const h = await startServer();
  return h(event, context);
};
