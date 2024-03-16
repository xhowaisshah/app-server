import { UpsDataArray } from "../../types/data";
import db from "../db";

const SyncData = async (message: Buffer) => {
  try {
    const data: UpsDataArray = JSON.parse(message.toString());
    const uniqueData = Array.from(new Map(data.map(item => [item.serialNumber, item])).values());

    await db.$transaction(async (tx) => {
      const updates = uniqueData.map(async (item) => {
        const existingCount = await tx.uPS.count({
          where: { serialNumber: item.serialNumber },
        });

        if (existingCount === 0) {
          console.log(`No UPS found with serialNumber: ${item.serialNumber}`);
          return;
        }

        await tx.uPS.update({
          where: { serialNumber: item.serialNumber },
          data: {
            logs: {
              create: {
                inputFaultVoltage: Number(item.inputFaultVoltage),
                outputCurrent: Number(item.outputCurrent),
                outputVoltage: Number(item.outputVoltage),
                batteryVoltage: Number(item.batteryVoltage),
                inputFrequency: Number(item.inputFrequency),
                temperature: Number(item.temperature),
                inputVoltage: Number(item.inputVoltage),
                serialNumber: item.serialNumber,
                beeper: Number(item.beeper),
                shutdown: Number(item.shutdown),
                upsStat: Number(item.upsStat),
                avgStat: Number(item.avgStat),
                batteryStat: Number(item.batteryStat),
                acStat: Number(item.acStat)
              },
            },
          },
        }).catch((err) => console.error(`Error updating UPS with serialNumber: ${item.serialNumber}`, err));

      });

      await Promise.all(updates);
    });

    console.log("UPS data updated successfully");
  } catch (error) {
    console.error("Error processing UPS data:", error);
  }
};

export { SyncData };
