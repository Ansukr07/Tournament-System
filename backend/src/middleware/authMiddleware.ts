import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("===== NEW REQUEST =====");
    console.log("Headers received:", req.headers);
    console.log("Authorization header:", req.headers.authorization);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log("❌ No Authorization header — rejecting");
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        console.log("❌ Invalid Authorization format");
        return res.status(401).json({ message: "Invalid authorization format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        console.log("✔ Token valid:", decoded);
        next();
    } catch (error) {
        console.log("❌ Token invalid:", error);
        res.status(401).json({ message: "Token is not valid" });
    }
};
