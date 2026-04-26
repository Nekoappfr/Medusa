import { MedusaService } from "@medusajs/framework/utils"
import Owner from "./models/owner"

class OwnerModuleService extends MedusaService({
  Owner,
}) {}

export default OwnerModuleService
