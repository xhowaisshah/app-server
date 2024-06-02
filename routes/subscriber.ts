import { Request, Response, Router } from "express";
import { client } from "../index";
import { ConnectionSchema, errorToMessage } from "../lib/validations";

const statusRouter = Router();

const subscribedTopics = new Set();


statusRouter.post('/subscriber', async (req: Request, res: Response) => {
    const validatedFields = ConnectionSchema.safeParse(req.body);

    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid connection", message: errorToMessage(validatedFields.error) });
    }

    const { type, topic } = validatedFields.data;

    try {

        switch (type) {
            case "subscribe":
                if (subscribedTopics.has(topic)) {
                    return res.status(400).json({ error: "Already subscribed to this topic" });
                }
                client.subscribe(topic);
                subscribedTopics.add(topic);
                res.status(200).json({ message: "Subscription successful" });
                break;
            case "unsubscribe":
                if (!subscribedTopics.has(topic)) {
                    return res.status(400).json({ error: "Not subscribed to this topic" });
                }
                subscribedTopics.delete(topic);
                client.unsubscribe(topic);
                res.status(200).json({ message: "Unsubscription successful" });
                break;
            default:
                res.status(400).json({ error: "Invalid connection type" });
        }
    } catch (error: any) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default statusRouter;
