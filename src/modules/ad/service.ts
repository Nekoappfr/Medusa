import { MedusaService } from "@medusajs/framework/utils"
import Ad from "./models/ad"

class AdModuleService extends MedusaService({
  Ad,
}) {}

export default AdModuleService
