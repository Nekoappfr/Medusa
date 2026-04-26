import OwnerModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const OWNER_MODULE = "owner"

export default Module(OWNER_MODULE, {
  service: OwnerModuleService,
})
