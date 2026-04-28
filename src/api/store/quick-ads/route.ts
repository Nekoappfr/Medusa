import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { OWNER_MODULE } from "../../../modules/owner"
import { CAT_MODULE } from "../../../modules/cat"
import { AD_MODULE } from "../../../modules/ad"

const ALLOWED_ORIGINS = (process.env.STORE_CORS || "http://localhost:3000,https://nekoapp.fr,https://www.nekoapp.fr").split(",").map(s => s.trim())

function setCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = req.headers.origin as string | undefined
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-publishable-api-key")
  res.setHeader("Access-Control-Allow-Credentials", "true")
}

export const OPTIONS = async (req: MedusaRequest, res: MedusaResponse) => {
  setCors(req, res)
  res.status(200).end()
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCors(req, res)

  const ownerService = req.scope.resolve(OWNER_MODULE)
  const catService = req.scope.resolve(CAT_MODULE)
  const adService = req.scope.resolve(AD_MODULE)

  const { contact_method, contact_value, cat_name, cat_notes, start_date, end_date, neighborhood } =
    req.body as Record<string, unknown>

  if (!contact_method || !contact_value || !cat_name || !start_date || !end_date) {
    return res.status(400).json({ message: "Champs obligatoires manquants" })
  }

  const contactVal = String(contact_value)
  const isEmail = contact_method === "email"
  const email = isEmail ? contactVal : `${contactVal.replace(/\D/g, "")}@neko-guest.fr`

  const ownerData: Record<string, unknown> = { email }
  if (!isEmail) ownerData.phone = contactVal

  const owner = await ownerService.createOwners(ownerData)

  const cat = await catService.createCats({
    name: String(cat_name),
    breed: "Non précisé",
    age: 1,
    owner_id: owner.id,
    notes: cat_notes ? String(cat_notes) : undefined,
  })

  const ad = await adService.createAds({
    owner_id: owner.id,
    cat_id: cat.id,
    service_type: "boarding",
    start_date: new Date(String(start_date)),
    end_date: new Date(String(end_date)),
    price_per_night: 20,
    neighborhood: neighborhood ? String(neighborhood) : undefined,
  })

  res.status(201).json({ ad_id: ad.id })
}
