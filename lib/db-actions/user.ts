import db from "../db";

const UpsExist = async (serialNumber: string) => {
  const Ups = await db.uPS.count({
    where: {
      serialNumber,
    },
  });

  return Ups > 0;
};

export { UpsExist };
