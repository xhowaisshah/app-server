import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import mqtt from "mqtt";
import statusRouter from "./routes/subscriber";
import { mqttOptions } from "./lib/constants";
import { SyncData } from "./lib/db-actions/data";

dotenv.config();
const subscribedTopics = new Set();

const app: Application = express();
const port = process.env.PORT || 8000;

export const client = mqtt.connect(mqttOptions);

client.on("connect", () => {});

const topic = "status";
if (!subscribedTopics.has(topic)) {
  client.subscribe(topic);
  subscribedTopics.add(topic);
  console.log(`Subscribed to topic: ${topic}`);
}

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

client.on("message", async (topic, message) => {
  console.log("topic: ", topic);
  await SyncData(message);
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/topic", statusRouter);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
