import { AbstractPaymentProvider, PaymentSessionStatus } from "@medusajs/framework/utils"
import createMollieClient, { Payment, PaymentStatus } from "@mollie/api-client"

type Options = {
  api_key: string
  redirect_url: string
  webhook_url: string
}

type InjectedDependencies = {
  logger: { info: (msg: string) => void; error: (msg: string) => void }
}

const mollieToMedusaStatus: Record<PaymentStatus, PaymentSessionStatus> = {
  open: PaymentSessionStatus.PENDING,
  pending: PaymentSessionStatus.PENDING,
  authorized: PaymentSessionStatus.AUTHORIZED,
  paid: PaymentSessionStatus.AUTHORIZED,
  failed: PaymentSessionStatus.ERROR,
  canceled: PaymentSessionStatus.CANCELED,
  expired: PaymentSessionStatus.ERROR,
}

class MolliePaymentProvider extends AbstractPaymentProvider<Options> {
  static identifier = "mollie"

  private mollie: ReturnType<typeof createMollieClient>
  protected logger_: InjectedDependencies["logger"]

  constructor(container: InjectedDependencies, options: Options) {
    super(container, options)
    this.mollie = createMollieClient({ apiKey: options.api_key })
    this.logger_ = container.logger
  }

  async initiatePayment(context: {
    amount: number
    currency_code: string
    context: { resource_id?: string }
  }) {
    try {
      const payment = await this.mollie.payments.create({
        amount: {
          value: (context.amount / 100).toFixed(2),
          currency: context.currency_code.toUpperCase(),
        },
        description: `Réservation Neko`,
        redirectUrl: this.options_.redirect_url,
        webhookUrl: this.options_.webhook_url,
        metadata: {
          resource_id: context.context?.resource_id,
        },
      })

      return {
        id: payment.id,
        data: {
          mollie_id: payment.id,
          checkout_url: (payment as any)._links?.checkout?.href ?? null,
          status: payment.status,
        },
      }
    } catch (e) {
      return { error: e.message, code: "mollie_initiate_error", detail: e }
    }
  }

  async authorizePayment(paymentSessionData: Record<string, unknown>) {
    try {
      const payment = await this.mollie.payments.get(paymentSessionData.mollie_id as string)
      const status = mollieToMedusaStatus[payment.status] ?? PaymentSessionStatus.PENDING
      return { status, data: { ...paymentSessionData, status: payment.status } }
    } catch (e) {
      return { error: e.message, code: "mollie_authorize_error", detail: e }
    }
  }

  async capturePayment(paymentData: Record<string, unknown>) {
    // Mollie captures automatically for iDEAL, Bancontact, etc.
    return paymentData
  }

  async cancelPayment(paymentData: Record<string, unknown>) {
    try {
      await this.mollie.payments.cancel(paymentData.mollie_id as string)
      return paymentData
    } catch (e) {
      // Payment may already be paid and non-cancellable
      return { error: e.message, code: "mollie_cancel_error", detail: e }
    }
  }

  async deletePayment(paymentData: Record<string, unknown>) {
    return await this.cancelPayment(paymentData)
  }

  async getPaymentStatus(paymentData: Record<string, unknown>) {
    try {
      const payment = await this.mollie.payments.get(paymentData.mollie_id as string)
      return { status: mollieToMedusaStatus[payment.status] ?? PaymentSessionStatus.PENDING }
    } catch (e) {
      return { status: PaymentSessionStatus.ERROR }
    }
  }

  async refundPayment(paymentData: Record<string, unknown>, refundAmount: number) {
    try {
      const refund = await this.mollie.paymentRefunds.create({
        paymentId: paymentData.mollie_id as string,
        amount: {
          value: (refundAmount / 100).toFixed(2),
          currency: (paymentData.currency_code as string)?.toUpperCase() ?? "EUR",
        },
      })
      return { ...paymentData, refund_id: refund.id }
    } catch (e) {
      return { error: e.message, code: "mollie_refund_error", detail: e }
    }
  }

  async retrievePayment(paymentData: Record<string, unknown>) {
    try {
      const payment = await this.mollie.payments.get(paymentData.mollie_id as string)
      return { ...paymentData, mollie_payment: payment }
    } catch (e) {
      return { error: e.message, code: "mollie_retrieve_error", detail: e }
    }
  }

  async updatePayment(context: {
    amount: number
    currency_code: string
    context: { resource_id?: string }
  }) {
    // Mollie doesn't support updating payments — create a new one
    return await this.initiatePayment(context)
  }

  async getWebhookActionAndData(data: { data: unknown }) {
    try {
      const body = data.data as { id: string }
      const payment = await this.mollie.payments.get(body.id)

      if (payment.status === "paid") {
        return {
          action: "captured" as const,
          data: {
            resource_id: (payment.metadata as any)?.resource_id as string,
            amount: Math.round(parseFloat(payment.amount.value) * 100),
          },
        }
      }

      if (payment.status === "failed" || payment.status === "expired" || payment.status === "canceled") {
        return {
          action: "failed" as const,
          data: {
            resource_id: (payment.metadata as any)?.resource_id as string,
          },
        }
      }

      return {
        action: "not_supported" as const,
        data: { resource_id: (payment.metadata as any)?.resource_id as string },
      }
    } catch (e) {
      return {
        action: "not_supported" as const,
        data: { resource_id: "" },
      }
    }
  }
}

export default MolliePaymentProvider
