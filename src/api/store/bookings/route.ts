import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOKING_MODULE } from "../../../modules/booking"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const bookingService = req.scope.resolve(BOOKING_MODULE)

  const filters: Record<string, unknown> = {}
  if (req.query.owner_id) filters.owner_id = req.query.owner_id
  if (req.query.sitter_id) filters.sitter_id = req.query.sitter_id
  if (req.query.status) filters.status = req.query.status

  const bookings = await bookingService.listBookings(filters)
  res.json({ bookings, count: bookings.length })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const bookingService = req.scope.resolve(BOOKING_MODULE)

  const { ad_id, sitter_id, owner_id, total_price, platform_fee } =
    req.body as Record<string, unknown>

  if (!ad_id || !sitter_id || !owner_id || total_price === undefined) {
    return res.status(400).json({ message: "Champs obligatoires manquants" })
  }

  const COMMISSION_RATE = 0.19

  const booking = await bookingService.createBookings({
    ad_id: ad_id as string,
    sitter_id: sitter_id as string,
    owner_id: owner_id as string,
    total_price: Number(total_price),
    platform_fee: platform_fee !== undefined ? Number(platform_fee) : Math.round(Number(total_price) * COMMISSION_RATE),
  })

  res.status(201).json({ booking })
}
