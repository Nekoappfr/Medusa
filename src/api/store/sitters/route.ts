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

  const {
    email,
    first_name,
    last_name,
    phone,
    bio,
    service_types,
    neighborhood,
    city,
    profile_type,
  } = req.body as Record<string, any>

  if (!email) {
    return res.status(400).json({ message: "email est requis" })
  }

  const authContext = (req as any).auth_context
  const user_id = authContext?.auth_identity_id ?? null

  const sitter = await sitterService.createSitters({
    user_id,
    email,
    first_name: first_name ?? null,
    last_name: last_name ?? null,
    phone: phone ?? null,
    bio: bio ?? null,
    service_types: service_types ?? [],
    neighborhood: neighborhood ?? "Paris",
    city: city ?? "Paris",
    profile_type: profile_type ?? "student",
    tags: [],
    is_available: true,
    is_expert: false,
  })

  res.status(201).json({ sitter })
}
