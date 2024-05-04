import * as z from "zod";

const SignUpSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const emailSchema = z.object({
  email: z.string().email(),
});

const OnbordingSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  email: z.string().email(),
  company: z.string().min(1, "Company name is required"),
  model: z.string().min(1, "Model is required"),
  version: z.string().min(1, "Version is required"),
});

const OtpValidationSchema = z.object({
  otp: z.string().min(6, "OTP is required"),
  email: z.string().email({ message: "Invalid email" }),
});

const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  email: z.string().email({ message: "Invalid email" }),
});

const ConnectionSchema = z.object({
  type: z.string().min(1, "Type is required"),
  topic: z.string().min(1, "Topic is required"),
});

const getLogsSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  email: z.string().email(),
  date: z.string().optional().default(new Date().toISOString()),
});

const errorToMessage = (error: z.ZodError) => {
  return error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
};

export {
  SignInSchema,
  SignUpSchema,
  emailSchema,
  OnbordingSchema,
  OtpValidationSchema,
  ResetPasswordSchema,
  ConnectionSchema,
  getLogsSchema,
  errorToMessage
};
