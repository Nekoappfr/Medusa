import { model } from "@medusajs/framework/utils"

const Application = model.define("application", {
  id: model.id().primaryKey(),
  ad_id: model.text(),
  sitter_id: model.text(),
  message: model.text().nullable(),
  status: model.enum(["pending", "accepted", "rejected"]).default("pending"),
})

export default Application
