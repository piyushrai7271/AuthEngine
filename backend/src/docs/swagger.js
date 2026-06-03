import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "AuthEngine API",
      version: "1.0.0",
      description:
        "Production-ready authentication system with JWT, OTP, Session Management and Role-Based Access Control",
    },

    servers: [
      {
        url: "http://localhost:4000",
        description: "Local Development",
      },
      {
        url: "https://authengine-production.up.railway.app",
        description: "Production",
      },
    ],
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
