import { ApolloServer } from "apollo-server";
import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const favoriteSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    types: { type: [String], required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: { type: [favoriteSchema], default: [] },
});
const User = mongoose.model("User", userSchema);

// GraphQL type definitions
const typeDefs = `#graphql
  type Favorite {
    id: Int!
    name: String!
    image: String!
    types: [String!]!
  }
  type User {
    id: ID!
    name: String!
    password: String!
    favorites: [Favorite!]!
  }
  type Query {
    users: [User!]!
    user(name: String!): User
  }
  type Mutation {
    register(name: String!, password: String!): User
    addFavorite(name: String!, favorite: FavoriteInput!): User
  }
  input FavoriteInput {
    id: Int!
    name: String!
    image: String!
    types: [String!]!
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    users: async () => await User.find(),
    user: async (_, args) => await User.findOne({ name: args.name }),
  },
  Mutation: {
    register: async (_, args) => {
      const { name, password } = args;
      if (!name || !password) throw new Error("Nombre y contraseña requeridos");
      try {
        const user = new User({ name, password });
        await user.save();
        return user;
      } catch (error) {
        if (error.code === 11000)
          throw new Error("El nombre ya está registrado");
        throw new Error("Error al crear usuario");
      }
    },
    addFavorite: async (_, args) => {
      const { name, favorite } = args;
      const user = await User.findOne({ name });
      if (!user) throw new Error("Usuario no encontrado");
      // Evitar duplicados por id
      if (!user.favorites.some((fav) => fav.id === favorite.id)) {
        user.favorites.push(favorite);
        await user.save();
      }
      return user;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const PORT = process.env.PORT || 3001;
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 GraphQL server ready at ${url}`);
});
