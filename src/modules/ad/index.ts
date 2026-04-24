import AdModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const AD_MODULE = "ad"

export default Module(AD_MODULE, {
  service: AdModuleService,
})
