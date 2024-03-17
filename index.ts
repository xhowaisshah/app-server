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

export const client = mqtt.connect('wss://572c94c900a0483dbc61d2c5afee025a.s1.eu.hivemq.cloud:8884/mqtt', mqttOptions);


client.on("connect", () => {
  console.log("MQTT client connected successfully.");
}).on("error", (error) => {
  console.error("MQTT client connection error:", error);
});

const topic = "status";
if (!subscribedTopics.has(topic)) {
  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic: ${topic}`, err);
    } else {
      subscribedTopics.add(topic);
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
}

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

client.on("message", async (topic, message) => {
  await SyncData(message);
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/topic", statusRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
