const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const logger = require("./middleware/logger");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger);

const allowedOrigins = ['http://localhost:3001', 'http://localhost:3002'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true
  })
);
app.options("*", cors());


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Интернет-магазин API с аутентификацией',
      version: '1.0.0',
      description: 'API для управления товарами с регистрацией и авторизацией',
      contact: {
        name: 'Разработчик',
        email: 'developer@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Локальный сервер разработки'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'first_name', 'last_name', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный идентификатор пользователя',
              example: 'u1234567'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя (логин)',
              example: 'user@example.com'
            },
            first_name: {
              type: 'string',
              description: 'Имя пользователя',
              example: 'Иван'
            },
            last_name: {
              type: 'string',
              description: 'Фамилия пользователя',
              example: 'Иванов'
            },
            password: {
              type: 'string',
              description: 'Хешированный пароль',
              example: '$2b$10$...'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['title', 'category', 'price'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный идентификатор товара',
              example: 'p1234567'
            },
            title: {
              type: 'string',
              description: 'Название товара',
              example: 'Печенье "Юбилейное"'
            },
            category: {
              type: 'string',
              description: 'Категория товара',
              example: 'Сладости'
            },
            description: {
              type: 'string',
              description: 'Описание товара',
              example: 'Классическое хрустящее печенье'
            },
            price: {
              type: 'number',
              description: 'Цена товара',
              minimum: 0,
              example: 79
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Список ошибок валидации'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Регистрация и авторизация пользователей'
      },
      {
        name: 'Products',
        description: 'Управление товарами'
      }
    ]
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Интернет-магазин API",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get("/", (req, res) => {
  res.send("Интернет-магазин API работает. Используйте /api-docs для документации");
});


app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);


app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
  console.log(`Swagger documentation: http://localhost:${PORT}/api-docs`);
});