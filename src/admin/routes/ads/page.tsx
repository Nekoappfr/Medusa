import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

export const config = defineRouteConfig({
  label: "Annonces",
  icon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
})

type Ad = {
  id: string
  owner_id: string
  cat_id: string
  service_type: string
  start_date: string
  end_date: string
  price_per_night: number
  status: string
  neighborhood: string | null
  notes: string | null
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  open:      { label: "Ouverte",    class: "bg-ui-tag-green-bg text-ui-tag-green-text" },
  matched:   { label: "Matchée",    class: "bg-ui-tag-blue-bg text-ui-tag-blue-text" },
  confirmed: { label: "Confirmée",  class: "bg-ui-tag-purple-bg text-ui-tag-purple-text" },
  completed: { label: "Terminée",   class: "bg-ui-tag-neutral-bg text-ui-tag-neutral-text" },
  cancelled: { label: "Annulée",    class: "bg-ui-tag-red-bg text-ui-tag-red-text" },
}

const SERVICE_LABELS: Record<string, string> = {
  boarding:     "Hébergement",
  visit:        "Visite",
  housesitting: "Garde à domicile",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const url = filter === "all" ? "/store/ads" : `/store/ads?status=${filter}`
    fetch(url, {
      credentials: "include",
      headers: {
        "x-publishable-api-key": "pk_02454d6725796fc4e706310bac6cba7f5ca2c46ea493b61b70e700fac788247d",
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setAds(data.ads ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError("Impossible de charger les annonces")
        setLoading(false)
      })
  }, [filter])

  if (loading) return <div className="p-8 text-ui-fg-subtle">Chargement...</div>
  if (error) return <div className="p-8 text-ui-fg-error">{error}</div>

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ui-fg-base">Annonces ({ads.length})</h1>
        <div className="flex gap-2">
          {["all", "open", "matched", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => { setLoading(true); setFilter(s) }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                filter === s
                  ? "bg-ui-button-inverted text-ui-fg-on-inverted border-transparent"
                  : "bg-ui-bg-base text-ui-fg-subtle border-ui-border-base hover:bg-ui-bg-subtle"
              }`}
            >
              {s === "all" ? "Toutes" : STATUS_LABELS[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ui-bg-subtle border-b border-ui-border-base">
            <tr>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Statut</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Service</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Dates</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Quartier</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Prix/nuit</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Créée le</th>
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ui-fg-muted italic">
                  Aucune annonce
                </td>
              </tr>
            )}
            {ads.map((ad, i) => {
              const status = STATUS_LABELS[ad.status] ?? { label: ad.status, class: "bg-ui-tag-neutral-bg text-ui-tag-neutral-text" }
              return (
                <tr
                  key={ad.id}
                  className={`border-b border-ui-border-base last:border-0 ${i % 2 === 0 ? "bg-ui-bg-base" : "bg-ui-bg-subtle"}`}
                >
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ui-fg-base">
                    {SERVICE_LABELS[ad.service_type] ?? ad.service_type}
                  </td>
                  <td className="px-4 py-3 text-ui-fg-subtle whitespace-nowrap">
                    {formatDate(ad.start_date)} → {formatDate(ad.end_date)}
                  </td>
                  <td className="px-4 py-3 text-ui-fg-subtle">
                    {ad.neighborhood ?? <span className="italic text-ui-fg-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-ui-fg-base font-medium">{ad.price_per_night}€</td>
                  <td className="px-4 py-3 text-ui-fg-subtle">{formatDate(ad.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
