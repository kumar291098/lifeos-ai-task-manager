import { Card, Statistic } from 'antd'

type MetricCardProps = {
  label: string
  value: number | string
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card className="metric-card" size="small">
      <Statistic title={label} value={value} />
    </Card>
  )
}
