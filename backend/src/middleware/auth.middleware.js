import jwt, { decode } from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        message: "Unauthorized. No Token provided",
      });
    }

    const secret = process.env.JWT_SECRET;

    const decoded = jwt.verify(token, secret);

    if (!decoded) {
      res.status(401).json({
        message: "Unauthorized. Invalid Token",
      });
    }

    const user = await User.findOne(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
