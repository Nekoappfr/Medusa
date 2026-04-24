import { model } from "@medusajs/framework/utils"

const Sitter = model.define("sitter", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  bio: model.text().nullable(),
  profile_type: model.enum(["student", "teenager", "traveler"]),
  service_types: model.array(),
  city: model.text(),
  neighborhood: model.text().nullable(),
  is_available: model.boolean().default(true),
  rating: model.float().default(0),
})

export default Sitter
