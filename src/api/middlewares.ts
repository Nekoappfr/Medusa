import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/sitters",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer"])],
    },
    {
      matcher: "/store/owners",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer"])],
    },
  ],
})
