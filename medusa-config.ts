import { loadEnv, defineConfig } from '@medusajs/framework/utils'
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000,https://nekoapp.fr,https://www.nekoapp.fr",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,https://api.nekoapp.fr",
      authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:9000,https://nekoapp.fr,https://www.nekoapp.fr",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    { resolve: "./src/modules/cat" },
    { resolve: "./src/modules/sitter" },
    { resolve: "./src/modules/ad" },
    { resolve: "./src/modules/application" },
    { resolve: "./src/modules/booking" },
    { resolve: "./src/modules/review" },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/providers/payment/mollie",
            id: "mollie",
            options: {
              api_key: process.env.MOLLIE_API_KEY,
              redirect_url: process.env.MOLLIE_REDIRECT_URL || "https://nekoapp.fr/paiement/confirmation",
              webhook_url: process.env.MOLLIE_WEBHOOK_URL || "https://api.nekoapp.fr/hooks/payment/mollie",
            },
          },
        ],
      },
    },
  ],
})
