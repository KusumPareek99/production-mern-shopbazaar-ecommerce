import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routing

//REGISTER || METHOD: POST || ACCESS: PUBLIC
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

// forgot password
router.post("/forgot-password", forgotPasswordController);

//test route
router.get("/test", requireSignIn, isAdmin, testController);

//protected route
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({
    ok: true,
  });
});


//protected route admin
router.get("/admin-auth", requireSignIn, isAdmin , (req, res) => {
  res.status(200).send({
    ok: true,
  });
});

// update profile
router.put('/profile', requireSignIn, updateProfileController)


// orders
router.get('/orders', requireSignIn, getOrdersController )


// orders
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController)

// order status udate
router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController)

export default router;
