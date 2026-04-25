import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITTER_MODULE } from "../../../../modules/sitter"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const sitterService = req.scope.resolve(SITTER_MODULE)

  try {
    const sitter = await sitterService.retrieveSitter(req.params.id)
    res.json({ sitter })
  } catch {
    res.status(404).json({ message: "Sitter introuvable" })
  }
}
