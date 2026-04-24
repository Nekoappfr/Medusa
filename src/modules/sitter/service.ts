import { MedusaService } from "@medusajs/framework/utils"
import Sitter from "./models/sitter"

class SitterModuleService extends MedusaService({
  Sitter,
}) {}

export default SitterModuleService
