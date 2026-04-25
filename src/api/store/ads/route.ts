import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AD_MODULE } from "../../../modules/ad"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const adService = req.scope.resolve(AD_MODULE)

  const filters: Record<string, unknown> = {}
  if (req.query.status) filters.status = req.query.status
  if (req.query.owner_id) filters.owner_id = req.query.owner_id
  if (req.query.service_type) filters.service_type = req.query.service_type

  const ads = await adService.listAds(filters)
  res.json({ ads, count: ads.length })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const adService = req.scope.resolve(AD_MODULE)

  const { owner_id, cat_id, service_type, start_date, end_date, price_per_night, neighborhood, notes } =
    req.body as Record<string, unknown>

  if (!owner_id || !cat_id || !service_type || !start_date || !end_date || !price_per_night) {
    return res.status(400).json({ message: "Champs obligatoires manquants" })
  }

  const ad = await adService.createAds({
    owner_id: owner_id as string,
    cat_id: cat_id as string,
    service_type: service_type as "boarding" | "visit" | "housesitting",
    start_date: new Date(start_date as string),
    end_date: new Date(end_date as string),
    price_per_night: Number(price_per_night),
    neighborhood: neighborhood as string | undefined,
    notes: notes as string | undefined,
  })

  res.status(201).json({ ad })
}
