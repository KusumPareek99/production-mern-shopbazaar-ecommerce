import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createProductController,
  getAllProductsController,
  getSingleProductController,
  getPhotoController,
  deleteProductController,
  updateProductController,
  productFilterController,
  productCountController,
  productListController,
  searchProductsController,
  relatedProductsController,
  productCategoryController,
  getBraintreeTokenController,
  braintreePaymentController,
} from "../controllers/productControllers.js";
import formidable from "express-formidable";
const router = express.Router();

//routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

// get all products
router.get("/get-all-products", getAllProductsController);

// get single product
router.get("/get-single-product/:slug", getSingleProductController);

// get photo
router.get("/get-photo/:pid", getPhotoController);

//delete product
router.delete(
  "/delete-product/:pid",
  requireSignIn,
  isAdmin,
  deleteProductController
);

// update product
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

// filter products
router.post("/product-filters", productFilterController);

// count products
router.get("/product-count", productCountController);

//products per page
router.get("/products-list/:page", productListController);

// search product
router.get("/search-product/:keyword", searchProductsController);

//similar product
router.get("/related-products/:pid/:cid", relatedProductsController);

// category wise product
router.get("/product-category/:slug", productCategoryController);

// braintree payment gateway controller
// token
router.get("/braintree/get-token", getBraintreeTokenController);

//payments
router.post("/braintree/payment", requireSignIn, braintreePaymentController);

export default router;
