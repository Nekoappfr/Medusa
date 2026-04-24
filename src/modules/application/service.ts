import { MedusaService } from "@medusajs/framework/utils"
import Application from "./models/application"

class ApplicationModuleService extends MedusaService({
  Application,
}) {}

export default ApplicationModuleService
