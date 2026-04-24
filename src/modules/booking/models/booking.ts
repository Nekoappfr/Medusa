import { model } from "@medusajs/framework/utils"

const Booking = model.define("booking", {
  id: model.id().primaryKey(),
  ad_id: model.text(),
  sitter_id: model.text(),
  owner_id: model.text(),
  status: model.enum(["confirmed", "in_progress", "completed", "cancelled"]).default("confirmed"),
  total_price: model.number(),
  platform_fee: model.number(),
})

export default Booking
