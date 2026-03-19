const express = require("express");
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');
const config = require('../config');

const router = express.Router();
const users = require('../data/users');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей (только для администратора)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       403:
 *         description: Доступ запрещен
 */
router.get("/", authMiddleware, roleMiddleware([config.ROLES.ADMIN]), (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID (только для администратора)
 *     tags: [Users]
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
 *         description: Данные пользователя
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Пользователь не найден
 */
router.get("/:id", authMiddleware, roleMiddleware([config.ROLES.ADMIN]), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя (только для администратора)
 *     tags: [Users]
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
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Пользователь не найден
 */
router.put("/:id", authMiddleware, roleMiddleware([config.ROLES.ADMIN]), async (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const { email, first_name, last_name, role, isActive } = req.body;

  if (email) users[userIndex].email = email.toLowerCase();
  if (first_name) users[userIndex].first_name = first_name.trim();
  if (last_name) users[userIndex].last_name = last_name.trim();
  if (role && config.ROLES[role.toUpperCase()]) {
    users[userIndex].role = role;
  }
  if (isActive !== undefined) {
    users[userIndex].isActive = isActive;
  }

  const { password, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (только для администратора)
 *     tags: [Users]
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
 *         description: Пользователь заблокирован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Пользователь не найден
 */
router.delete("/:id", authMiddleware, roleMiddleware([config.ROLES.ADMIN]), (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[userIndex].isActive = false;

  res.json({ 
    message: "User blocked successfully",
    user: {
      id: users[userIndex].id,
      email: users[userIndex].email,
      isActive: false
    }
  });
});

module.exports = router;