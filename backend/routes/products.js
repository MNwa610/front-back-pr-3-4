const express = require("express");
const { nanoid } = require("nanoid");

const router = express.Router();
let products = require("../data/products");

/**
 * Вспомогательная функция для поиска товара по ID
 * @param {string} id - ID товара
 * @returns {Object|null} - Найденный товар или null
 */
function findById(id) {
  return products.find((p) => p.id === id) || null;
}

/**
 * Валидация данных товара
 * @param {Object} data - Данные для валидации
 * @param {boolean} isPatch - Флаг частичного обновления
 * @returns {string[]} - Массив ошибок валидации
 */
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
  
  if (!isPatch || data.price !== undefined) {
    const price = Number(data.price);
    if (data.price === undefined || isNaN(price) || price < 0) {
      errors.push("price must be a positive number");
    }
  }
  
  if (!isPatch || data.stock !== undefined) {
    const stock = Number(data.stock);
    if (data.stock !== undefined && (isNaN(stock) || stock < 0 || !Number.isInteger(stock))) {
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

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     description: Получить массив всех товаров в магазине
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     description: Возвращает один товар по его уникальному идентификатору
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *         example: p1234567
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Product not found"
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/:id", (req, res) => {
  const product = findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создает новый товар
 *     description: Добавляет новый товар в каталог
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название товара
 *                 example: "Новый товар"
 *               category:
 *                 type: string
 *                 description: Категория товара
 *                 example: "Электроника"
 *               description:
 *                 type: string
 *                 description: Описание товара
 *                 example: "Описание нового товара"
 *               price:
 *                 type: number
 *                 description: Цена товара
 *                 minimum: 0
 *                 example: 999
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *                 minimum: 0
 *                 example: 10
 *               rating:
 *                 type: number
 *                 description: Рейтинг товара (0-5)
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *               imageUrl:
 *                 type: string
 *                 description: URL изображения
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/", (req, res) => {
  const { title, category, description, price, stock, rating, imageUrl } = req.body;

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
    stock: Number(stock) || 0,
    rating: rating !== undefined ? Number(rating) : 0,
    imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : ""
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/*
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Частично обновляет товар
 *     description: Обновляет одно или несколько полей товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *         example: p1234567
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название товара
 *               category:
 *                 type: string
 *                 description: Категория товара
 *               description:
 *                 type: string
 *                 description: Описание товара
 *               price:
 *                 type: number
 *                 description: Цена товара
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *                 minimum: 0
 *               rating:
 *                 type: number
 *                 description: Рейтинг товара
 *                 minimum: 0
 *                 maximum: 5
 *               imageUrl:
 *                 type: string
 *                 description: URL изображения
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации или ничего не обновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     description: Удаляет товар по его ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *         example: p1234567
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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