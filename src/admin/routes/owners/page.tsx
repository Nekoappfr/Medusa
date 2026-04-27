import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

export const config = defineRouteConfig({
  label: "Propriétaires",
  icon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
})

type Owner = {
  id: string
  user_id: string | null
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  arrondissement: string | null
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/store/owners", {
      credentials: "include",
      headers: {
        "x-publishable-api-key": "pk_02454d6725796fc4e706310bac6cba7f5ca2c46ea493b61b70e700fac788247d",
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setOwners(data.owners ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError("Impossible de charger les propriétaires")
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-ui-fg-subtle">Chargement...</div>
  if (error) return <div className="p-8 text-ui-fg-error">{error}</div>

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ui-fg-base">Propriétaires ({owners.length})</h1>
      </div>

      <div className="rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ui-bg-subtle border-b border-ui-border-base">
            <tr>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Nom</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Email</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Téléphone</th>
              <th className="px-4 py-3 text-left text-ui-fg-subtle font-medium">Arrondissement</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o, i) => (
              <tr
                key={o.id}
                className={`border-b border-ui-border-base last:border-0 ${i % 2 === 0 ? "bg-ui-bg-base" : "bg-ui-bg-subtle"}`}
              >
                <td className="px-4 py-3 text-ui-fg-base font-medium">
                  {o.first_name || o.last_name
                    ? `${o.first_name ?? ""} ${o.last_name ?? ""}`.trim()
                    : <span className="text-ui-fg-muted italic">—</span>}
                </td>
                <td className="px-4 py-3 text-ui-fg-subtle">{o.email}</td>
                <td className="px-4 py-3 text-ui-fg-subtle">{o.phone ?? "—"}</td>
                <td className="px-4 py-3 text-ui-fg-subtle">
                  {o.arrondissement ? `${o.arrondissement}e` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
