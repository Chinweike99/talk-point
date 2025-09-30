import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
