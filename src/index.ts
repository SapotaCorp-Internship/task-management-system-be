import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import authRoutes from "@/modules/auth/auth.routes.js";
import categoryRoutes from "@/modules/categories/category.routes.js";
import taskRoutes from "@/modules/tasks/task.routes.js";
import reminderRoutes from "./modules/reminders/reminder.route.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import passport from "@/config/auth.js";
import { swaggerSpecs } from "@/config/swagger.js";
import { startReminderCron } from "@/modules/reminders/reminder.cron.js";
import { createServer } from "http";
import { initSocket } from "./config/socker.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://task-management-system-fyxl32jwi-minhhoang1225s-projects.vercel.app";

const specs = swaggerSpecs;

initSocket(httpServer);

app.use(morgan("dev"));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === FRONTEND_URL) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reminders", reminderRoutes);

app.use(errorHandler);

startReminderCron();

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
