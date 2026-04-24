import { MedusaService } from "@medusajs/framework/utils"
import Cat from "./models/cat"

class CatModuleService extends MedusaService({
  Cat,
}) {}

export default CatModuleService
