import CatModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CAT_MODULE = "cat"

export default Module(CAT_MODULE, {
  service: CatModuleService,
})
