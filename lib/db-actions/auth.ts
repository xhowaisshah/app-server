import db from "../db";
import bcrypt from "bcryptjs";

const userExists = async (email: string) => {
  const count = await db.user.count({
    where: {
      email,
    },
  });
  return count > 0;
};

const createUser = async (email: string, password: string, name: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  return user;
};

const user = async (email: string) => {
  const user = await db.user.findUnique({
    where: { email },
  });
  return user;
};

export { userExists, createUser, user };
