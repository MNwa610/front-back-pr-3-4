const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require("nanoid");
const authMiddleware = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

let users = [];
let refreshTokens = [];

async function hashPassword(password) {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function findUserByEmail(email) {
  return users.find(u => u.email === email) || null;
}

function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    {
      sub: user.id,
      type: 'refresh'
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.REFRESH_EXPIRES_IN }
  );

  refreshTokens.push({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return { accessToken, refreshToken };
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
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
 *                 example: ivan@example.com
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Иванов
 *               password:
 *                 type: string
 *                 format: password
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/register", async (req, res) => {
  try {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Некорректный формат email" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Пароль должен быть минимум 6 символов" });
    }

    const existingUser = findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "Пользователь с таким email уже существует" });
    }

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
    res.status(201).json(userWithoutPassword);

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
 *                 example: ivan@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    const user = findUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      accessToken, 
      refreshToken,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление access токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh токен
 *     responses:
 *       200:
 *         description: Новые токены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Невалидный refresh токен
 */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  const storedToken = refreshTokens.find(rt => rt.token === refreshToken);
  if (!storedToken) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  if (new Date(storedToken.expiresAt) < new Date()) {
    refreshTokens = refreshTokens.filter(rt => rt.token !== refreshToken);
    return res.status(401).json({ error: "Refresh token expired" });
  }

  try {
    const payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    
    const user = users.find(u => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const newTokens = generateTokens(user);
    refreshTokens = refreshTokens.filter(rt => rt.token !== refreshToken);

    res.json(newTokens);
  } catch (err) {
    refreshTokens = refreshTokens.filter(rt => rt.token !== refreshToken);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 */
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    id: req.user.sub,
    email: req.user.email,
    first_name: req.user.first_name,
    last_name: req.user.last_name
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный выход
 *       401:
 *         description: Не авторизован
 */
router.post("/logout", authMiddleware, (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens = refreshTokens.filter(rt => rt.token !== refreshToken);
  }

  res.json({ message: "Logged out successfully" });
});

if (process.env.NODE_ENV === 'development') {
  router.get("/debug/users", (req, res) => {
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  });
}

module.exports = router;