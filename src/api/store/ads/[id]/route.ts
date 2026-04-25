import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AD_MODULE } from "../../../../modules/ad"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const adService = req.scope.resolve(AD_MODULE)

  try {
    const ad = await adService.retrieveAd(req.params.id)
    res.json({ ad })
  } catch {
    res.status(404).json({ message: "Annonce introuvable" })
  }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const adService = req.scope.resolve(AD_MODULE)

  await adService.deleteAds(req.params.id)
  res.status(200).json({ id: req.params.id, deleted: true })
}
