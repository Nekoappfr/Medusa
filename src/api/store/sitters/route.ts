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

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const sitterService = req.scope.resolve(SITTER_MODULE)

  const { bio, service_types, neighborhood, city, profile_type } = req.body as {
    bio: string
    service_types: string[]
    neighborhood?: string
    city?: string
    profile_type: "student" | "teenager" | "traveler"
  }

  const user_id = (req as any).auth_context?.actor_id ?? "anonymous"

  try {
    const sitter = await sitterService.createSitters({
      user_id,
      bio,
      profile_type,
      service_types,
      neighborhood: neighborhood ?? "Paris",
      city: city ?? "Paris",
    })
    res.status(201).json({ sitter })
  } catch (error: any) {
    res.status(500).json({ message: error.message, details: String(error) })
  }
}
