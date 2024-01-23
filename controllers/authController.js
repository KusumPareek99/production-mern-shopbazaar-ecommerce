import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    //validations
    if (!name) {
      return res.send({ message: "Name is required", success: false });
    }
    if (!email) {
      return res.send({ message: "Email is required", success: false });
    }
    if (!password) {
      return res.send({ message: "Password is required", success: false });
    }
    if (!phone) {
      return res.send({ message: "Phone number is required", success: false });
    }
    if (!address) {
      return res.send({ message: "Address is required", success: false });
    }

    if (!answer) {
      return res.send({ message: "Answer is required", success: false });
    }

    //check user
    const existingUser = await userModel.findOne({ email });

    //check if user already exists
    if (existingUser) {
      return res.status(200).send({
        message: "User already exists. Please Login",
        success: false,
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);

    //save user
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    }).save();
    res
      .status(200)
      .send({ message: "User registered successfully", success: true, user });
  } catch (error) {
    console.log(`Error in registerController: ${error.message}`.bgRed.white);
    res.status(500).json({ message: error.message, success: false });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validations
    if (!email || !password) {
      return res
        .status(404)
        .send({ message: "Invalid email or password", success: false });
    }

    //check user
    const user = await userModel.findOne({ email });

    //check if user exists
    if (!user) {
      return res
        .status(200)
        .send({ message: "Email is not registered", success: false });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(200).send({
        message: "Invalid Credentials",
        success: false,
      });
    }

    //generate token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    //send response
    res.status(200).send({
      message: "User logged in successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(`Error in loginController: ${error.message}`.bgRed.white);
    res.status(500).json({ message: error.message, success: false, error });
  }
};

// forgot password
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    console.log(email, answer, newPassword);
    if (!email || !answer || !newPassword) {
      return res
        .status(200)
        .send({ message: "All fields are required", success: false });
    }

    // check email and answer
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res
        .status(200)
        .send({ message: "Invalid email or answer", success: false });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res
      .status(200)
      .send({ message: "Password changed successfully", success: true });
  } catch (error) {
    console.log(
      `Error in forgotPasswordController: ${error.message}`.bgRed.white
    );
    res.status(500).json({ message: error.message, success: false, error });
  }
};

//test controller
export const testController = async (req, res) => {
  try {
    res.status(200).send({ message: "Test controller", success: true });
  } catch (error) {
    console.log(`Error in testController: ${error.message}`.bgRed.white);
    res.status(500).json({ message: error.message, success: false });
  }
};

// update profile controller
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);

    if (password && password.length < 6) {
      return res.json({
        message: "Password is required and must be 6 character long",
      });
    }
    const hashedPAssword = password ? await hashPassword(password) : undefined;
    const updateUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        email: email || user.email,
        password: hashedPAssword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully!",
      updateUser,
    });
  } catch (error) {
    console.log("Error while updating profile");
    res.status(500).json({ message: error.message, success: false, error });
  }
};
// get orders controller
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("buyer", "name")
      .populate("products", "-photo")
      .sort({ createdAt: -1 });
    res.status(200).send({ success: true, orders });
  } catch (error) {
    console.log("Error while getting orders");
    res.status(500).json({ message: error.message, success: false, error });
  }
};

// admin get all orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("buyer", "name")
      .populate("products", "-photo")
      .sort({ createdAt: -1 });
    res.status(200).send({ success: true, orders });
  } catch (error) {
    console.log("Error in getting all orders controller");
    res.status(500).json({ message: error.message, success: false, error });
  }
};

//admin order status controller
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.status(200).send({ success: true, orders });
  } catch (error) {
    console.log("Error while updating order status");
    res.status(500).json({ message: error.message, success: false, error });
  }
};
