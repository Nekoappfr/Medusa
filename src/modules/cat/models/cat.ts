import { model } from "@medusajs/framework/utils"

const Cat = model.define("cat", {
  id: model.id().primaryKey(),
  name: model.text(),
  breed: model.text(),
  age: model.number(),
  is_medicated: model.boolean().default(false),
  is_anxious: model.boolean().default(false),
  is_kitten: model.boolean().default(false),
  notes: model.text().nullable(),
  owner_id: model.text(),
})

export default Cat
