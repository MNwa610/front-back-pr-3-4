const express = require("express");
const { nanoid } = require("nanoid");

const router = express.Router();

let products = require("../data/products");


function findById(id) {
  return products.find((p) => p.id === id) || null;
}

function validateProduct(data, isPatch = false) {
  const errors = [];
  
  if (!isPatch || data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim() === "") {
      errors.push("title is required (string)");
    }
  }
  
  if (!isPatch || data.category !== undefined) {
    if (data.category !== undefined && (typeof data.category !== "string" || data.category.trim() === "")) {
      errors.push("category must be a non-empty string");
    }
  }
  
  if (!isPatch || data.description !== undefined) {
    if (data.description !== undefined && typeof data.description !== "string") {
      errors.push("description must be a string");
    }
  }
  
  if (!isPatch || data.price !== undefined) {
    const price = Number(data.price);
    if (data.price === undefined || isNaN(price) || price < 0) {
      errors.push("price must be a positive number");
    }
  }
  
  if (!isPatch || data.stock !== undefined) {
    const stock = Number(data.stock);
    if (data.stock === undefined || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      errors.push("stock must be a non-negative integer");
    }
  }
  
  if (!isPatch || data.rating !== undefined) {
    if (data.rating !== undefined) {
      const rating = Number(data.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        errors.push("rating must be a number between 0 and 5");
      }
    }
  }
  
  return errors;
}

router.get("/", (req, res) => {
  res.json(products);
});

router.get("/:id", (req, res) => {
  const product = findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.post("/", (req, res) => {
  const { title, category, description, price, stock, rating, imageUrl } = req.body;

  // Валидация
  const errors = validateProduct({ title, category, description, price, stock, rating });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newProduct = {
    id: nanoid(8),
    title: title.trim(),
    category: category ? category.trim() : "Без категории",
    description: description ? description.trim() : "",
    price: Number(price),
    stock: Number(stock),
    rating: rating !== undefined ? Number(rating) : 0,
    imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : "",
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.patch("/:id", (req, res) => {
  const product = findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { title, category, description, price, stock, rating, imageUrl } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const errors = validateProduct({ title, category, description, price, stock, rating }, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (title !== undefined) product.title = String(title).trim();
  if (category !== undefined) product.category = String(category).trim();
  if (description !== undefined) product.description = String(description).trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (imageUrl !== undefined) product.imageUrl = String(imageUrl).trim();

  res.json(product);
});
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  
  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }

  products = products.filter((p) => p.id !== id);
  res.status(204).send(); 
});

module.exports = router;