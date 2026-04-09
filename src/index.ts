import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import authRoutes from "@/modules/auth/route/auth.routes.js";
import categoryRoutes from "@/modules/categories/route/category.routes.js";
import taskRoutes from "@/modules/tasks/route/task.routes.js";
import reminderRoutes from "./modules/reminders/route/reminder.route.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import passport from "@/config/auth.js";
import { swaggerSpecs } from "@/config/swagger.js";
import notificationRoutes from "@/modules/notifications/route/notification.routes.js";
import { startReminderCron } from "@/modules/reminders/service/reminder.cron.js";
import { createServer } from "http";
import { initSocket } from "./config/socker.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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
app.use("/api/notifications", notificationRoutes);
app.use("/api/reminders", reminderRoutes);

app.use(errorHandler);

startReminderCron();

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
