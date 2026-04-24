import { model } from "@medusajs/framework/utils"

const Review = model.define("review", {
  id: model.id().primaryKey(),
  booking_id: model.text(),
  reviewer_id: model.text(),
  reviewed_id: model.text(),
  rating: model.number(),
  comment: model.text().nullable(),
})

export default Review
