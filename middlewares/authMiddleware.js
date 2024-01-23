import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// protected routes token base

export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(`Error in requireSignIn: ${error.message}`.bgRed.white);
    res.status(500).json({ message: error.message, success: false });
  }
};

// admin routes token base
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      // earlier status code was 401 so error was thrown on client page so changed it to 200
      return res
        .status(200)
        .send({ message: "Admin resource. Access denied", success: false });
    } else {
      next();
    }
  } catch (error) {
    console.log(`Error in isAdmin: ${error.message}`.bgRed.white);
    res.status(500).json({ message: error.message, success: false });
  }
};
