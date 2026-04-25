import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITTER_MODULE } from "../../../modules/sitter"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const sitterService = req.scope.resolve(SITTER_MODULE)

  const filters: Record<string, unknown> = {}
  if (req.query.is_available !== undefined) {
    filters.is_available = req.query.is_available === "true"
  }
  if (req.query.neighborhood) {
    filters.neighborhood = req.query.neighborhood
  }
  if (req.query.arrondissement) {
    filters.arrondissement = req.query.arrondissement
  }

  const sitters = await sitterService.listSitters(filters)
  res.json({ sitters, count: sitters.length })
}
