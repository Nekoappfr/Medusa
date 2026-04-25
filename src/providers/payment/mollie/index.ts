import { AbstractPaymentProvider, PaymentSessionStatus } from "@medusajs/framework/utils"
import createMollieClient, { PaymentStatus } from "@mollie/api-client"

type Options = {
  api_key: string
  redirect_url: string
  webhook_url: string
}

type InjectedDependencies = {
  logger: { info: (msg: string) => void; error: (msg: string) => void }
}

const toMedusaStatus = (status: PaymentStatus): PaymentSessionStatus => {
  switch (status) {
    case "paid":
    case "authorized":
      return PaymentSessionStatus.AUTHORIZED
    case "canceled":
      return PaymentSessionStatus.CANCELED
    case "failed":
    case "expired":
      return PaymentSessionStatus.ERROR
    default:
      return PaymentSessionStatus.PENDING
  }
}

class MolliePaymentProvider extends AbstractPaymentProvider<Options> {
  static identifier = "mollie"

  private mollie: ReturnType<typeof createMollieClient>
  private opts: Options

  constructor(container: InjectedDependencies, options: Options) {
    super(container, options)
    this.opts = options
    this.mollie = createMollieClient({ apiKey: options.api_key })
  }

  async initiatePayment(input: Record<string, any>): Promise<any> {
    try {
      const amount = Number(input.amount)
      const payment = await this.mollie.payments.create({
        amount: {
          value: (amount / 100).toFixed(2),
          currency: (input.currency_code as string).toUpperCase(),
        },
        description: `Réservation Neko`,
        redirectUrl: this.opts.redirect_url,
        webhookUrl: this.opts.webhook_url,
        metadata: {
          session_id: input.context?.session_id,
          resource_id: input.context?.resource_id,
        },
      })

      return {
        id: payment.id,
        data: {
          mollie_id: payment.id,
          session_id: input.context?.session_id,
          checkout_url: (payment as any)._links?.checkout?.href ?? null,
          status: payment.status,
        },
      }
    } catch (e: any) {
      return { error: e.message, code: "mollie_initiate_error", detail: e }
    }
  }

  async authorizePayment(input: Record<string, any>): Promise<any> {
    try {
      const data = input.data ?? input
      const payment = await this.mollie.payments.get(data.mollie_id as string)
      return {
        status: toMedusaStatus(payment.status),
        data: { ...data, status: payment.status },
      }
    } catch (e: any) {
      return {
        status: PaymentSessionStatus.ERROR,
        data: input.data ?? input,
      }
    }
  }

  async capturePayment(input: Record<string, any>): Promise<any> {
    return { data: input.data ?? input }
  }

  async cancelPayment(input: Record<string, any>): Promise<any> {
    try {
      const data = input.data ?? input
      await this.mollie.payments.cancel(data.mollie_id as string)
      return { data }
    } catch (e: any) {
      return { data: input.data ?? input }
    }
  }

  async deletePayment(input: Record<string, any>): Promise<any> {
    return await this.cancelPayment(input)
  }

  async getPaymentStatus(input: Record<string, any>): Promise<any> {
    try {
      const data = input.data ?? input
      const payment = await this.mollie.payments.get(data.mollie_id as string)
      return { status: toMedusaStatus(payment.status) }
    } catch {
      return { status: PaymentSessionStatus.ERROR }
    }
  }

  async refundPayment(input: Record<string, any>): Promise<any> {
    try {
      const data = input.data ?? input
      const amount = Number(input.amount)
      const refund = await this.mollie.paymentRefunds.create({
        paymentId: data.mollie_id as string,
        amount: {
          value: (amount / 100).toFixed(2),
          currency: ((data.currency_code as string) ?? "EUR").toUpperCase(),
        },
      })
      return { data: { ...data, refund_id: refund.id } }
    } catch (e: any) {
      return { data: input.data ?? input }
    }
  }

  async retrievePayment(input: Record<string, any>): Promise<any> {
    try {
      const data = input.data ?? input
      const payment = await this.mollie.payments.get(data.mollie_id as string)
      return { data: { ...data, mollie_payment: payment } }
    } catch {
      return { data: input.data ?? input }
    }
  }

  async updatePayment(input: Record<string, any>): Promise<any> {
    return await this.initiatePayment(input)
  }

  async getWebhookActionAndData(input: {
    data: Record<string, unknown>
    rawData: string | Buffer
    headers: Record<string, unknown>
  }): Promise<any> {
    try {
      const body = input.data as { id?: string }
      if (!body.id) return { action: "not_supported", data: { session_id: "" } }

      const payment = await this.mollie.payments.get(body.id)
      const meta = payment.metadata as any

      if (payment.status === "paid") {
        return {
          action: "captured",
          data: {
            session_id: meta?.session_id ?? "",
            resource_id: meta?.resource_id ?? "",
            amount: Math.round(parseFloat(payment.amount.value) * 100),
          },
        }
      }

      if (["failed", "expired", "canceled"].includes(payment.status)) {
        return {
          action: "failed",
          data: {
            session_id: meta?.session_id ?? "",
            resource_id: meta?.resource_id ?? "",
          },
        }
      }

      return {
        action: "not_supported",
        data: { session_id: meta?.session_id ?? "" },
      }
    } catch {
      return { action: "not_supported", data: { session_id: "" } }
    }
  }
}

export default MolliePaymentProvider
