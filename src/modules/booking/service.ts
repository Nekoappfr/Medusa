import { MedusaService } from "@medusajs/framework/utils"
import Booking from "./models/booking"

class BookingModuleService extends MedusaService({
  Booking,
}) {}

export default BookingModuleService
