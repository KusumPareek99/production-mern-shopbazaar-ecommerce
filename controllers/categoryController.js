import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const createcategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(401)
        .send({ message: "Name is required", success: false });
    //check existing category
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory)
      return res
        .status(200)
        .send({ message: "Category already exists", success: false });
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res
      .status(201)
      .send({ message: "New category created", success: true, category });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error in Category", success: false, error });
  }
};

//update category controller
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    if (!category) {
      return res
        .status(404)
        .send({ message: "Category not found", success: false });
    }
    res.status(200).send({
      message: "Category updated successfully",
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while updating Category",
      success: false,
      error,
    });
  }
};

// get all categories
export const allCategoryConroller = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      message: "All categories",
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting all Categories",
      success: false,
      error,
    });
  }
};

export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    // if category is not found
    if (!category) {
      return res
        .status(404)
        .send({ message: "Category not found", success: false });
    }

    res.status(200).send({
      message: "Single category found successfully.",
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting this Category",
      success: false,
      error,
    });
  }
};

// delete category controler
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .send({ message: "Category not found", success: false });
    }
    res.status(200).send({
      message: "Category deleted successfully",
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while deleting this Category",
      success: false,
      error,
    });
  }
};
