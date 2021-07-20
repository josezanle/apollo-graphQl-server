const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const { dbConnection } = require("./config/db");
require("dotenv").config(".env");
const jwt = require("jsonwebtoken");

// iniciando base de base
dbConnection();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers["authorization"] || "";
    // console.log(token);
    if (token) {
      try {
        const usuario = jwt.verify(token, process.env.SECRETA);
        return { usuario };
      } catch (error) {
        console.log(error);
      }
    }
  },
});
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
