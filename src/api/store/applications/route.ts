import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { APPLICATION_MODULE } from "../../../modules/application"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const applicationService = req.scope.resolve(APPLICATION_MODULE)

  const filters: Record<string, unknown> = {}
  if (req.query.ad_id) filters.ad_id = req.query.ad_id
  if (req.query.sitter_id) filters.sitter_id = req.query.sitter_id
  if (req.query.status) filters.status = req.query.status

  const applications = await applicationService.listApplications(filters)
  res.json({ applications, count: applications.length })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const applicationService = req.scope.resolve(APPLICATION_MODULE)

  const { ad_id, sitter_id, message } = req.body as Record<string, unknown>

  if (!ad_id || !sitter_id) {
    return res.status(400).json({ message: "ad_id et sitter_id sont obligatoires" })
  }

  const application = await applicationService.createApplications({
    ad_id: ad_id as string,
    sitter_id: sitter_id as string,
    message: message as string | undefined,
  })

  res.status(201).json({ application })
}
