import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Task Management System API",
    version: "1.0.0",
    description: "API for Task Management System",
  },
  servers: [
    {
      url: process.env.APP_URL || "http://localhost:3000",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "./src/modules/auth/route/auth.routes.ts",
  "./src/modules/categories/route/category.routes.ts",
  "./src/modules/tasks/route/task.routes.ts",
];

swaggerAutogen()(outputFile, endpointsFiles, doc);
