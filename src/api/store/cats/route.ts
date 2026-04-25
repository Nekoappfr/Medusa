import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CAT_MODULE } from "../../../modules/cat"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const catService = req.scope.resolve(CAT_MODULE)

  const filters: Record<string, unknown> = {}
  if (req.query.owner_id) filters.owner_id = req.query.owner_id

  const cats = await catService.listCats(filters)
  res.json({ cats, count: cats.length })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const catService = req.scope.resolve(CAT_MODULE)

  const { name, breed, age, owner_id, is_medicated, is_anxious, is_kitten, notes } =
    req.body as Record<string, unknown>

  if (!name || !breed || age === undefined || !owner_id) {
    return res.status(400).json({ message: "Champs obligatoires manquants" })
  }

  const cat = await catService.createCats({
    name: name as string,
    breed: breed as string,
    age: Number(age),
    owner_id: owner_id as string,
    is_medicated: Boolean(is_medicated),
    is_anxious: Boolean(is_anxious),
    is_kitten: Boolean(is_kitten),
    notes: notes as string | undefined,
  })

  res.status(201).json({ cat })
}
