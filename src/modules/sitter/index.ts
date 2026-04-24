import SitterModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const SITTER_MODULE = "sitter"

export default Module(SITTER_MODULE, {
  service: SitterModuleService,
})
