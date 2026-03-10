const express = require("express");
const bcrypt = require('bcrypt');
const { nanoid } = require("nanoid");

const router = express.Router();

let users = [];

/**
 * Хеширование пароля
 * @param {string} password - Пароль для хеширования
 * @returns {Promise<string>} - Хешированный пароль
 */
async function hashPassword(password) {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

/**
 * Проверка пароля
 * @param {string} password - Введенный пароль
 * @param {string} hash - Хеш из базы
 * @returns {Promise<boolean>} - Результат проверки
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Поиск пользователя по email
 * @param {string} email - Email пользователя
 * @returns {Object|null} - Найденный пользователь или null
 */
function findUserByEmail(email) {
  return users.find(u => u.email === email) || null;
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     description: Создает нового пользователя с хешированием пароля
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя (будет использоваться как логин)
 *                 example: ivan@example.com
 *               first_name:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 description: Фамилия пользователя
 *                 example: Иванов
 *               password:
 *                 type: string
 *                 description: Пароль (минимум 6 символов)
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: u1234567
 *                 email:
 *                   type: string
 *                   example: ivan@example.com
 *                 first_name:
 *                   type: string
 *                   example: Иван
 *                 last_name:
 *                   type: string
 *                   example: Иванов
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", async (req, res) => {
  const { email, first_name, last_name, password } = req.body;


  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ 
      error: "Все поля (email, first_name, last_name, password) обязательны" 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Некорректный формат email" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Пароль должен быть минимум 6 символов" });
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: "Пользователь с таким email уже существует" });
  }

  try {
    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: nanoid(8),
      email: email.toLowerCase(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      password: hashedPassword,
      created_at: new Date().toISOString()
    };

    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      ...userWithoutPassword,
      message: "User created successfully"
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     description: Авторизация пользователя по email и паролю
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *                 example: ivan@example.com
 *               password:
 *                 type: string
 *                 description: Пароль
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверный пароль
 *       404:
 *         description: Пользователь не найден
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }


  const user = findUserByEmail(email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  try {

    const isValid = await verifyPassword(password, user.password);

    if (isValid) {

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        success: true, 
        user: userWithoutPassword,
        message: "Login successful" 
      });
    } else {
      res.status(401).json({ error: "Неверный пароль" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает список пользователей (только для тестирования)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 */
router.get("/users", (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

module.exports = router;