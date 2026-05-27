import './KpiCard.css'

type KpiCardProps = {
  label: string
  value: string
}

function KpiCard({ label, value }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

export default KpiCard
