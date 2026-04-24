import ApplicationModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const APPLICATION_MODULE = "application"

export default Module(APPLICATION_MODULE, {
  service: ApplicationModuleService,
})
