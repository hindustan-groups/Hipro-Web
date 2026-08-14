import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Route imports
import authRouter from "./routes/auth";
import adminUsersRouter from "./routes/adminUsers";
import blogsRouter from "./routes/blogs";
import contactRouter from "./routes/contact";
import dashboardRouter from "./routes/dashboard";
import guaranteesRouter from "./routes/guarantees";
import heroRouter from "./routes/hero";
import jobsRouter from "./routes/jobs";
import newsletterRouter from "./routes/newsletter";
import projectsRouter from "./routes/projects";
import quoteRouter from "./routes/quote";
import servicesRouter from "./routes/services";
import settingsRouter from "./routes/settings";
import statsRouter from "./routes/stats";
import teamRouter from "./routes/team";
import testimonialsRouter from "./routes/testimonials";
import applicationsRouter from "./routes/applications";
import locationsRouter from "./routes/locations";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// API route registrations
app.use("/api/auth", authRouter);
app.use("/api/admin-users", adminUsersRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/guarantees", guaranteesRouter);
app.use("/api/hero", heroRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/services", servicesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/team", teamRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/locations", locationsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Standalone Express backend is running on port ${PORT}`);
});
