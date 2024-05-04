import { UpsDataArray } from "../../types/data";
import db from "../db";

const SyncData = async (message: Buffer) => {
  try {
    const data: UpsDataArray = JSON.parse(message.toString());
    const uniqueData = [...new Map(data.map(item => [item.SrNo, item])).values()];
    console.log(uniqueData);
    await db.$transaction(async (tx) => {
      const updates = uniqueData.map(async (item) => {
        const existingCount = await tx.uPS.count({
          where: { serialNumber: item.SrNo },
        });

        if (existingCount === 0) {
          console.log(`No UPS found with serialNumber: ${item.SrNo}`);
          return;
        }

        await tx.uPS.update({
          where: { serialNumber: item.SrNo },
          data: {
            logs: {
              create: {
                inputFaultVoltage: Number(item.inFaultVolt),
                outputCurrent: Number(item.outCurrent),
                outputVoltage: Number(item.outVolt),
                batteryVoltage: Number(item.battVolt),
                inputFrequency: Number(item.inFreq),
                temperature: Number(item.tempC),
                inputVoltage: Number(item.inVolt),
                serialNumber: item.SrNo,
                beeper: Number(item.Beeper),
                shutdown: Number(item.shutdown),
                upsStat: Number(item.upsStat),
                avgStat: Number(item.avrStat),
                batteryStat: Number(item.batteryStat),
                acStat: Number(item.acStat)
              },
            },
          },
        }).catch((err) => console.error(`Error updating UPS with serialNumber: ${item.SrNo}`, err));

      });

      await Promise.all(updates);
    });

    console.log("UPS data updated successfully");
  } catch (error) {
    console.error("Error processing UPS data:", error);
  }
};

export { SyncData };
