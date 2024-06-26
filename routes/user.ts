import { Request, Response, Router } from "express";
import { emailSchema, OnbordingSchema, errorToMessage, getLogsSchema } from "../lib/validations";
import { user } from "../lib/db-actions/auth";
import db from "../lib/db";
import { UpsExist } from "../lib/db-actions/user";
const userRouter = Router();

userRouter.post('/onboarding', async (req: Request, res: Response) => {
    const validatedFields = OnbordingSchema.safeParse(req.body);

    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid data", message: errorToMessage(validatedFields.error) });
    }
    const { serialNumber, email, company, model, version } = validatedFields.data;


    try {

        const OnboardByServer = Boolean(true);

        if (!OnboardByServer) return res.status(409).json({ error: "Invalid SerialNumber", success: false });
        const userExists = await user(email);
        if (!userExists) {
            return res.status(404).json({ error: "User not found", success: false });
        }

        const upsExists = await UpsExist(serialNumber);
        if (!upsExists) {
            await db.uPS.create({
                data: {
                    serialNumber,
                    company,
                    model,
                    version,
                    wifi: '',
                    owner: {
                        connect: { email }
                    }
                }
            });
        } else {
            await db.user.update({
                where: {
                    email
                },
                data: {
                    referencedUPS: {
                        connect: {
                            serialNumber
                        }
                    }
                }
            });
        }

        return res.status(200).json({ message: "Onboarded successfully", success: true });
    } catch (error: any) {
        console.error("Onboarding error:", error);
        return res.status(500).json({ error: "Internal server error", success: false });
    }
});


userRouter.post('/ups-listing', async (req: Request, res: Response) => {

    const validatedFields = emailSchema.safeParse(req.body);
    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid data", message: errorToMessage(validatedFields.error) });
    }

    const { email } = validatedFields.data;
    try {

        const upsList = await db.uPS.findMany({
            where: {
                owner: {
                    email
                }
            }
        });

        const referencedUPS = await db.uPS.findMany({
            where: {
                user: {
                    email
                }
            }
        });

        const allUPS = [...upsList, ...referencedUPS];

        if (allUPS.length === 0) {
            return res.status(404).json({ error: "No UPS found", success: false });
        }

        return res.status(200).json({ message: "UPS list fetched successfully", success: true, data: allUPS });
    } catch (error: any) {
        console.error("Ups listing error:", error);
        return res.status(500).json({ error: "Internal server error", success: false });
    }
});

userRouter.post('/logs-by-date', async (req: Request, res: Response) => {
    const validatedFields = getLogsSchema.safeParse(req.body);
    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid data", message: errorToMessage(validatedFields.error) });
    }
    const { serialNumber, email, date } = validatedFields.data;

    try {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const logs = await db.uPSData.findMany({
            where: {
                serialNumber,
                // ups: {
                //     owner: {
                //         email
                //     }
                // },
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            },
        });
        if (logs.length === 0) {
            return res.status(404).json({ error: "No logs found for this date", success: false });
        }
        return res.status(200).json({
            serialNumber: serialNumber,
            data: {
                logs: logs.map((log) => ({
                    inputVoltage: log.inputVoltage,
                    inputFaultVoltage: log.inputFaultVoltage,
                    outputVoltage: log.outputVoltage,
                    outputCurrent: log.outputCurrent,
                    inputFrequency: log.inputFrequency,
                    batteryVoltage: log.batteryVoltage,
                    temperature: log.temperature,
                    timestamp: log.timestamp
                })),
                events: logs.map((log) => ({
                    beeper: log.beeper,
                    shutdown: log.shutdown,
                    upsStat: log.upsStat,
                    avgStat: log.avgStat,
                    batteryStat: log.batteryStat,
                    acStat: log.acStat,
                    timestamp: log.timestamp
                }))
            }
        });
    } catch (error: any) {
        console.error("Error fetching logs:", error);
        return res.status(500).json({ error: "Internal server error", success: false });
    }
});

userRouter.post('/logs', async (req: Request, res: Response) => {
    const validatedFields = getLogsSchema.safeParse(req.body);
    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid data", message: errorToMessage(validatedFields.error) });
    }
    const { serialNumber, email } = validatedFields.data;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const logs = await db.uPSData.findMany({
            where: {
                serialNumber,
                // ups: {
                //     owner: {
                //         email
                //     }
                // },
                timestamp: {
                    gte: today,
                    lt: tomorrow
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });
        return res.status(200).json({
            serialNumber: serialNumber,
            data: {
                logs: logs.map((log) => ({
                    inputVoltage: log.inputVoltage,
                    inputFaultVoltage: log.inputFaultVoltage,
                    outputVoltage: log.outputVoltage,
                    outputCurrent: log.outputCurrent,
                    inputFrequency: log.inputFrequency,
                    batteryVoltage: log.batteryVoltage,
                    temperature: log.temperature,
                    timestamp: log.timestamp
                })),
                events: logs.map((log) => ({
                    beeper: log.beeper,
                    shutdown: log.shutdown,
                    upsStat: log.upsStat,
                    avgStat: log.avgStat,
                    batteryStat: log.batteryStat,
                    acStat: log.acStat,
                    timestamp: log.timestamp
                }))
            }
        });
    } catch (error: any) {
        console.error("Error fetching logs:", error);
        return res.status(500).json({ error: "Internal server error", success: false });
    }
});


userRouter.get('/delete-all/:serialNumber', async (req: Request, res: Response) => {
    const { serialNumber } = req.params;
    try {
        const upsExists = await UpsExist(serialNumber);
        if (!upsExists) {
            return res.status(404).json({ error: "UPS not found", success: false });
        }
        
        const deleteLogsResult = await db.uPSData.deleteMany({
            where: {
                serialNumber,
            }
        });
        
        if (deleteLogsResult.count === 0) {
            return res.status(404).json({ error: "No logs found to delete", success: false });
        }

        const deleteUpsResult = await db.uPS.delete({
            where: {
                serialNumber
            }
        });

        if (!deleteUpsResult) {
            return res.status(500).json({ error: "Failed to delete UPS", success: false });
        }

        return res.status(200).json({ message: "All logs and UPS deleted successfully", success: true });
    } catch (error: any) {
        console.error("Error deleting logs and UPS:", error);
        return res.status(500).json({ error: "Internal server error", success: false });
    }
});

userRouter.post('/disconnect', async (req: Request, res: Response) => {
    const { serialNumber, email } = req.body;
    try {
        const upsExists = await UpsExist(serialNumber);
        if (!upsExists) {
            return res.status(404).json({ error: "UPS not found", success: false });
        }

        // First, disconnect the UPS from the user
        await db.user.update({
            where: {
                email
            },
            data: {
                ownedUPS: {
                    disconnect: {
                        serialNumber
                    }
                },
                referencedUPS: {
                    disconnect: {
                        serialNumber
                    }
                }
            }
        });

        return res.status(200).json({ message: "UPS disconnected successfully", success: true });
    } catch (error: any) {
        console.error("Error during UPS disconnection:", error);
        return res.status(500).json({ error: "Internal server error", success: false });
    }
});

export default userRouter;
