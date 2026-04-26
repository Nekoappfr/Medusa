import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { OWNER_MODULE } from "../../../modules/owner"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const ownerService = req.scope.resolve(OWNER_MODULE)

  const { email, first_name, last_name, phone, arrondissement } =
    req.body as Record<string, any>

  if (!email) {
    return res.status(400).json({ message: "email est requis" })
  }

  const authContext = (req as any).auth_context
  const user_id = authContext?.auth_identity_id ?? null

  const owner = await ownerService.createOwners({
    user_id,
    email,
    first_name: first_name ?? null,
    last_name: last_name ?? null,
    phone: phone ?? null,
    arrondissement: arrondissement ?? null,
  })

  res.status(201).json({ owner })
}
