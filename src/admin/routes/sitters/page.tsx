import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

export const config = defineRouteConfig({
  label: "Sitters",
  icon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
})

type Sitter = {
  id: string
  user_id: string
  bio: string | null
  profile_type: string
  service_types: string[]
  city: string
  neighborhood: string | null
  arrondissement: string | null
  is_available: boolean
  is_expert: boolean
  rating: number
  review_count: number
  price_per_night: number
  years_experience: number
  completed_bookings: number
  tags: string[]
}

export default function SittersPage() {
  const [sitters, setSitters] = useState<Sitter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/store/sitters", {
      credentials: "include",
      headers: {
        "x-publishable-api-key": "pk_02454d6725796fc4e706310bac6cba7f5ca2c46ea493b61b70e700fac788247d",
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setSitters(data.sitters ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError("Impossible de charger les sitters")
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-ui-fg-subtle">Chargement...</div>
  if (error) return <div className="p-8 text-ui-fg-error">{error}</div>

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ui-fg-base">Sitters ({sitters.length})</h1>
      </div>

      <div className="rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ui-bg-subtle border-b border-ui-border-base">
            <tr>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Nom / Bio</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Type</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Ville</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Prix/nuit</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Note</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Dispo</th>
            </tr>
          </thead>
          <tbody>
            {sitters.map((s, i) => (
              <tr
                key={s.id}
                className={`border-b border-ui-border-base last:border-0 ${i % 2 === 0 ? "bg-ui-bg-base" : "bg-ui-bg-subtle"}`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-ui-fg-base">{s.user_id}</div>
                  {s.bio && <div className="text-ui-fg-subtle text-xs mt-0.5 max-w-xs truncate">{s.bio}</div>}
                  {s.tags?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {s.tags.map((t) => (
                        <span key={t} className="text-xs bg-ui-tag-neutral-bg text-ui-tag-neutral-text px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-ui-fg-subtle capitalize">{s.profile_type}</td>
                <td className="px-4 py-3 text-ui-fg-subtle">
                  {s.city}
                  {s.arrondissement && <span className="ml-1 text-xs">({s.arrondissement}e)</span>}
                </td>
                <td className="px-4 py-3 text-ui-fg-base font-medium">{s.price_per_night}€</td>
                <td className="px-4 py-3 text-ui-fg-subtle">
                  {s.rating > 0 ? `★ ${s.rating.toFixed(1)} (${s.review_count})` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.is_available ? "bg-ui-tag-green-bg text-ui-tag-green-text" : "bg-ui-tag-red-bg text-ui-tag-red-text"}`}>
                    {s.is_available ? "Disponible" : "Indisponible"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
