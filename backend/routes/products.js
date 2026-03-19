const express = require("express");
const { nanoid } = require("nanoid");
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');
const config = require('../config');

const router = express.Router();

let products = [
  {
    id: nanoid(8),
    title: "Печенье Юбилейное",
    category: "Сладости",
    description: "Классическое хрустящее печенье",
    price: 79
  },
  {
    id: nanoid(8),
    title: "Молоко Простоквашино",
    category: "Напитки",
    description: "Ультрапастеризованное молоко 2.5%",
    price: 99
  },
  {
    id: nanoid(8),
    title: "Хлеб Бородинский",
    category: "Выпечка",
    description: "Ржаной хлеб с кориандром",
    price: 59
  },
  {
    id: nanoid(8),
    title: "Яблоки Гренни Смит",
    category: "Фрукты",
    description: "Зеленые кисло-сладкие яблоки",
    price: 129
  },
  {
    id: nanoid(8),
    title: "Шоколад Аленка",
    category: "Сладости",
    description: "Молочный шоколад",
    price: 89
  },
  {
    id: nanoid(8),
    title: "Колбаса Докторская",
    category: "Мясные изделия",
    description: "Вареная колбаса высшего сорта",
    price: 249
  },
  {
    id: nanoid(8),
    title: "Сок Добрый",
    category: "Напитки",
    description: "Апельсиновый сок 1л",
    price: 119
  },
  {
    id: nanoid(8),
    title: "Макароны Barilla",
    category: "Бакалея",
    description: "Спагетти из твердых сортов",
    price: 139
  },
  {
    id: nanoid(8),
    title: "Йогурт Activia",
    category: "Молочные продукты",
    description: "Питьевой йогурт с клубникой",
    price: 69
  },
  {
    id: nanoid(8),
    title: "Кофе Lavazza",
    category: "Напитки",
    description: "Молотый кофе 250г",
    price: 399
  }
];

function findProductById(id) {
  return products.find(p => p.id === id) || null;
}

function validateProduct(data) {
  const errors = [];
  
  if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
    errors.push("title is required");
  }
  
  if (!data.category || typeof data.category !== "string" || data.category.trim() === "") {
    errors.push("category is required");
  }
  
  if (!data.description || typeof data.description !== "string") {
    errors.push("description is required");
  }
  
  const price = Number(data.price);
  if (data.price === undefined || isNaN(price) || price < 0) {
    errors.push("price must be a positive number");
  }
  
  return errors;
}

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров (доступно всем аутентифицированным пользователям)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *       401:
 *         description: Не авторизован
 */
router.get("/", authMiddleware, (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID (доступно всем аутентифицированным пользователям)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
router.get("/:id", authMiddleware, (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар (только для продавца и администратора)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Товар создан
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль seller или admin)
 */
router.post("/", authMiddleware, roleMiddleware([config.ROLES.SELLER, config.ROLES.ADMIN]), (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { title, category, description, price } = req.body;
  
  const newProduct = {
    id: nanoid(8),
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price)
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар (только для продавца и администратора)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Товар не найден
 */
router.put("/:id", authMiddleware, roleMiddleware([config.ROLES.SELLER, config.ROLES.ADMIN]), (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { title, category, description, price } = req.body;
  
  product.title = title.trim();
  product.category = category.trim();
  product.description = description.trim();
  product.price = Number(price);

  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (только для администратора)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (только для администратора)
 *       404:
 *         description: Товар не найден
 */
router.delete("/:id", authMiddleware, roleMiddleware([config.ROLES.ADMIN]), (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  
  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }

  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

module.exports = router;