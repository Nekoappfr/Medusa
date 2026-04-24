import { model } from "@medusajs/framework/utils"

const Ad = model.define("ad", {
  id: model.id().primaryKey(),
  owner_id: model.text(),
  cat_id: model.text(),
  service_type: model.enum(["boarding", "visit", "housesitting"]),
  start_date: model.dateTime(),
  end_date: model.dateTime(),
  price_per_night: model.number(),
  status: model.enum(["open", "matched", "confirmed", "completed", "cancelled"]).default("open"),
  neighborhood: model.text().nullable(),
  notes: model.text().nullable(),
})

export default Ad
