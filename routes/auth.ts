import { Request, Response, Router } from "express";
import db from "../lib/db";
import { emailSchema, OtpValidationSchema, ResetPasswordSchema, SignInSchema, SignUpSchema, errorToMessage } from "../lib/validations";
import bcrypt from 'bcryptjs';
import otpgenerator from 'otp-generator';
import { createUser, userExists } from "../lib/db-actions/auth";
const authRouter = Router();

authRouter.post('/sign-up', async (req: Request, res: Response) => {
    const validatedFields = SignUpSchema.safeParse(req.body);

    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid email or password", message: errorToMessage(validatedFields.error) });
    }

    const { email, name, password } = validatedFields.data;

    try {
        const exists = await userExists(email);
        if (exists) {
            return res.status(400).json({ error: "User already exists" });
        }

        const newUser = await createUser(email, password, name);
        const { password: _, ...userInfo } = newUser;
        res.status(201).json({ message: "User created successfully", user: userInfo });
    } catch (error: any) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

authRouter.post('/sign-in', async (req: Request, res: Response) => {
    const validatedFields = SignInSchema.safeParse(req.body);

    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid email or password", message: errorToMessage(validatedFields.error) });
    }

    const { password } = validatedFields.data;

    try {
        const user = await db.user.findUnique({
            where: { email: validatedFields.data.email },
        });



        if (!user || !(await bcrypt.compare(password, user.password!))) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const { password: _, ...userInfo } = user;
        res.status(200).json({ message: "User signed in successfully", user: userInfo });
    } catch (error: any) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
    const validatedFields = emailSchema.safeParse(req.body);
    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid email", message: errorToMessage(validatedFields.error) });
    }

    const { email } = validatedFields.data;

    try {

        const user = await userExists(email);

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        //// send otp to email

        const OTP = otpgenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false, digits: true });

        await db.user.update({
            where: {
                email
            },
            data: {
                passwordOtp: parseInt(OTP),
                OtpExpiry: new Date(Date.now() + 10 * 60 * 1000)
            }
        })

        res.status(200).json({ message: "OTP sent successfully", redirect: "/auth/reset-password" });

    } catch (error: any) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

authRouter.post('/otp-verification', async (req: Request, res: Response) => {
    const validatedFields = OtpValidationSchema.safeParse(req.body);

    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid OTP", message: errorToMessage(validatedFields.error) });
    }

    const { otp, email } = validatedFields.data;

    try {

        const Otp = await db.user.findFirst({
            where: {
                passwordOtp: parseInt(otp)
            }
        })

        if (!Otp || Otp.email !== email) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (Otp.OtpExpiry && Otp.OtpExpiry < new Date()) {
            return res.status(400).json({ error: "OTP expired" });
        }

        res.status(200).json({ message: "OTP verified successfully", redirect: "/auth/reset-password" });
    } catch (error: any) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
    const validatedFields = ResetPasswordSchema.safeParse(req.body);

    if (!validatedFields.success) {
        return res.status(400).json({ error: "Invalid password", message: errorToMessage(validatedFields.error) });
    }

    const { password, email } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.update({
            where: {
                email
            },
            data: {
                password: hashedPassword
            }
        })

        res.status(200).json({ message: "Password reset successfully", redirect: "/auth/sign-in" });
    } catch (error: any) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default authRouter;