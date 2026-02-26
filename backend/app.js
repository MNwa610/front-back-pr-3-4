const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const logger = require("./middleware/logger");
const productsRouter = require("./routes/products");

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
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true
  })
);
app.options("*", cors());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Интернет-магазин API',
      version: '1.0.0',
      description: 'API для управления товарами интернет-магазина',
      contact: {
        name: 'Разработчик',
        email: 'developer@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
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
              example: 'Классическое хрустящее печенье с ванильным вкусом'
            },
            price: {
              type: 'number',
              description: 'Цена товара в рублях',
              minimum: 0,
              example: 79
            },
            stock: {
              type: 'integer',
              description: 'Количество товара на складе',
              minimum: 0,
              example: 20
            },
            rating: {
              type: 'number',
              description: 'Рейтинг товара (0-5)',
              minimum: 0,
              maximum: 5,
              example: 4.6
            },
            imageUrl: {
              type: 'string',
              description: 'URL изображения товара',
              example: 'https://example.com/image.jpg'
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
  customSiteTitle: "Интернет-магазин API Документация",
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
  res.send(`
    <html>
      <head>
        <title>Интернет-магазин API</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
          h1 { color: #333; }
          .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
          a { color: #6366f1; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 5px; }
          .endpoint { background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>Интернет-магазин API</h1>
        <div class="card">
          <h2>Доступные эндпоинты:</h2>
          <ul>
            <li><span class="endpoint">GET /api/products</span> - список всех товаров</li>
            <li><span class="endpoint">GET /api/products/{id}</span> - товар по ID</li>
            <li><span class="endpoint">POST /api/products</span> - создать новый товар</li>
            <li><span class="endpoint">PATCH /api/products/{id}</span> - обновить товар</li>
            <li><span class="endpoint">DELETE /api/products/{id}</span> - удалить товар</li>
          </ul>
        </div>
        <div class="card">
          <h2>📚 Интерактивная документация</h2>
          <p>Посетите <a href="/api-docs" class="button">/api-docs</a> для работы с API через Swagger UI</p>
          <p>Также доступна <a href="/api-docs.json">OpenAPI спецификация в JSON</a></p>
        </div>
      </body>
    </html>
  `);
});

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