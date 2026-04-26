import { model } from "@medusajs/framework/utils"

const Sitter = model.define("sitter", {
  id: model.id().primaryKey(),
  user_id: model.text().nullable(),
  email: model.text(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  phone: model.text().nullable(),
  bio: model.text().nullable(),
  profile_type: model.enum(["student", "teenager", "traveler"]),
  service_types: model.array(),
  city: model.text(),
  neighborhood: model.text().nullable(),
  arrondissement: model.text().nullable(),
  is_available: model.boolean().default(true),
  is_expert: model.boolean().default(false),
  rating: model.float().default(0),
  review_count: model.number().default(0),
  price_per_night: model.number().default(20),
  response_time: model.text().nullable(),
  years_experience: model.number().default(0),
  completed_bookings: model.number().default(0),
  tags: model.array(),
  color_tint: model.text().nullable(),
})

export default Sitter
