import { model } from "@medusajs/framework/utils"

const Owner = model.define("owner", {
  id: model.id().primaryKey(),
  user_id: model.text().nullable(),
  email: model.text(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  phone: model.text().nullable(),
  arrondissement: model.text().nullable(),
})

export default Owner
