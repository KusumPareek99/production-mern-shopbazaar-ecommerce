import productModel from "../models/productModel.js";
import fs from "fs";
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from "dotenv";
dotenv.config();

// braintree gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validations
    switch (true) {
      case !name:
        return res.status(400).send({
          message: "name is required",
          success: false,
        });

      case !description:
        return res.status(400).send({
          message: "description is required",
          success: false,
        });

      case !category:
        return res.status(400).send({
          message: "category is required",
          success: false,
        });

      case !price:
        return res.status(400).send({
          message: "price is required",
          success: false,
        });

      case !quantity:
        return res.status(400).send({
          message: "quantity is required",
          success: false,
        });

      case !photo && photo.size > 1000000:
        return res.status(400).send({
          message: "image should be less than 1mb",
          success: false,
        });
    }

    //create product
    const products = new productModel({
      ...req.fields,
      slug: slugify(name),
    });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      message: "product created successfully",
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in creating product",
      success: false,
      error,
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });

    if (!products)
      return res.status(400).send({
        message: "products not found",
        success: false,
      });

    res.status(200).send({
      message: "all products",
      success: true,
      total_count: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in getting all products",
      success: false,
      error,
    });
  }
};

// get single product

export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    if (!product)
      return res.status(400).send({
        message: "product not found",
        success: false,
      });
    res.status(200).send({
      message: "single product found successfully",
      success: true,
      product,
    });
  } catch {
    console.log(error);
    res.status(500).send({
      message: "error in getting all products",
      success: false,
      error,
    });
  }
};

// get photo
export const getPhotoController = async (req, res) => {
  try {
    const productPhoto = await productModel
      .findById(req.params.pid)
      .select("photo");

    if (productPhoto.photo.data) {
      res.set("Content-Type", productPhoto.photo.contentType);
      return res.status(200).send(productPhoto.photo.data);
    } else {
      return res.status(400).send({
        message: "photo not found",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId") {
      return res.status(400).send({
        message: "object id not found",
        success: false,
      });
    } else if (error.name === "CastError") {
      return res.status(400).send({
        message: "cast error found",
        success: false,
      });
    } else if (error.name === "TypeError") {
      return res.status(400).send({
        message: "type error found",
        success: false,
      });
    } else if (error.name === "Error") {
      return res.status(400).send({
        message: "error found",
        success: false,
      });
    } else if (error.name === "RangeError") {
      return res.status(400).send({
        message: "range error found",
        success: false,
      });
    }
    // res.status(500).send({
    //   message: "error in getting product photo",
    //   success: false,
    //   error,
    // });
  }
};

//delete product
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");

    res.status(200).send({
      message: "product deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in deleting product",
      success: false,
      error,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const existingProduct = await productModel.findById(req.params.pid);

    if (!existingProduct) {
      return res.status(404).send({
        message: "Product not found",
        success: false,
      });
    }

    const updatedFields = {};
    const { name, description, price, category, quantity, shipping } =
      req.fields;

    // Identify changed fields and update only those
    if (name && name !== existingProduct.name) {
      updatedFields.name = name;
    }

    if (description && description !== existingProduct.description) {
      updatedFields.description = description;
    }

    if (price && price !== existingProduct.price) {
      updatedFields.price = price;
    }

    if (category && category !== existingProduct.category) {
      updatedFields.category = category;
    }

    if (quantity && quantity !== existingProduct.quantity) {
      updatedFields.quantity = quantity;
    }

    if (shipping && shipping !== existingProduct.shipping) {
      updatedFields.shipping = shipping;
    }

    // Update photo only if a new photo is provided
    if (req.files && req.files.photo) {
      const { photo } = req.files;
      updatedFields.photo = {
        data: fs.readFileSync(photo.path),
        contentType: photo.type,
      };
    }

    // Update only if there are changes
    if (Object.keys(updatedFields).length > 0) {
      const updatedProduct = await productModel.findByIdAndUpdate(
        req.params.pid,
        { ...existingProduct.toObject(), ...updatedFields },
        { new: true }
      );

      res.status(200).send({
        message: "Product updated successfully",
        success: true,
        product: updatedProduct,
      });
    } else {
      // No changes, send a response indicating that
      res.status(200).send({
        message: "No changes detected. Product remains unchanged.",
        success: true,
        product: existingProduct,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error in updating product",
      success: false,
      error,
    });
  }
};

// filter product
export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length) {
      args.category = checked;
    }
    if (radio.length) {
      args.price = { $gte: radio[0], $lte: radio[1] };
    }
    console.log(`category args: ${args.category}`);
    console.log(`price args: ${args.price}`);
    const products = await productModel.find(args);
    res.status(200).send({
      message: "Filtered products",
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      message: "Error in filtering product",
      success: false,
      error,
    });
  }
};

//product count controller

export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      message: "Total product count",
      success: true,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      message: "Error in counting product",
      success: false,
      error,
    });
  }
};
// product per page: product list controller
export const productListController = async (req, res) => {
  try {
    const page = req.params.page ? req.params.page : 1;
    const perPage = 2;
    const products = await productModel
      .find({})
      .select("-photo")
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      message: "Product list per page",
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      message: "Error in getting product list per page",
      success: false,
      error,
    });
  }
};

export const searchProductsController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const searchResults = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      message: "Products found",
      success: true,
      searchResults,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      message: "Error in searching product",
      success: false,
      error,
    });
  }
};

//similar product
export const relatedProductsController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const relatedProducts = await productModel
      .find({ category: cid, _id: { $ne: pid } })
      .limit(3)
      .populate("category")
      .select("-photo");

    res.status(200).send({
      message: "Related products",
      success: true,
      relatedProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in getting related products",
      success: false,
      error,
    });
  }
};

// category wise product controller
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      message: "Category wise products",
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in getting related products",
      success: false,
      error,
    });
  }
};

// braintree token
export const getBraintreeTokenController = async (req, res) => {
  try {
    await gateway.clientToken.generate({}, (err, response) => {
      if (err) {
        return res.status(500).send({
          message: "error in getting braintree token",
          success: false,
          error: err,
        });
      }
      res.status(200).send({
        message: "Braintree token",
        success: true,
        token: response.clientToken,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in getting braintree token",
      success: false,
      error,
    });
  }
};

// braintree payment
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((item) => {
      total = total + item.price;
    });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.status(200).send({
            message: "Payment Completed Successfully",
            success: true,
            result,
          });
        } else {
          res.status(500).send({
            message:
              "Payment failed, try again. If the amount was deducted from your account let us know.",
            success: false,
            error,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in getting braintree payment",
      success: false,
      error,
    });
  }
};
