import { authenticate } from "@medusajs/framework/http"
import { defineMiddlewares } from "@medusajs/medusa"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/sitters",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer"])],
    },
  ],
})
