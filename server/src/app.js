import cors from "cors";
import express from "express";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./utils/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
  })
);
app.use(express.json());

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

