import swaggerJsdoc from "swagger-jsdoc";

// option object to describe the project first and its bersion and route on which it is running
const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "AuthEngine API",
      version: "1.0.0",
      description:
        "Production-ready authentication system with JWT, OTP, Session Management and Role-Based Access Control",
    },
    // local and deployed url define 
    servers: [
      {
        url: "http://localhost:4000", // local route url
        description: "Local Development",
      },
      {
        url: "https://authengine-production.up.railway.app",  // production url
        description: "Production",
      },
    ],
  },
  // location for searching routes in project folder. 
  apis: [
    "./src/routes/*.js",
    "./src/docs/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

// swagger YMAL define on top of every route for which we are documenting
