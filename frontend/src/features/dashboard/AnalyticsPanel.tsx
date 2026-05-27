import type { Analytics, Task } from '../../types/task'
import { MetricCard } from '../../components/MetricCard'

interface AnalyticsPanelProps {
  analytics: Analytics
  completedTasks: Task[]
  activeTasks: Task[]
}

export function AnalyticsPanel({ analytics, completedTasks, activeTasks }: AnalyticsPanelProps) {
  // 1. Calculate 7-Day Completion Trend
  const getLast7Days = () => {
    const list = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      list.push({
        dateStr: d.toDateString(),
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: 0
      })
    }
    return list
  }

  const trendData = getLast7Days()
  completedTasks.forEach((task) => {
    if (task.completedAt) {
      const completionDate = new Date(task.completedAt).toDateString()
      const match = trendData.find((t) => t.dateStr === completionDate)
      if (match) {
        match.count += 1
      }
    }
  })

  // Build SVG coordinates for line chart
  const maxCount = Math.max(...trendData.map((d) => d.count), 3) // min scale of 3
  const width = 280
  const height = 100
  const paddingX = 20
  const paddingY = 15

  const points = trendData.map((d, index) => {
    const x = paddingX + (index / (trendData.length - 1)) * (width - 2 * paddingX)
    const y = height - paddingY - (d.count / maxCount) * (height - 2 * paddingY)
    return { x, y, label: d.label, count: d.count }
  })

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` 
    : ''

  // 2. Classify tasks into categories dynamically to construct category chart
  const getCategory = (task: Task) => {
    const title = task.title.toLowerCase()
    const notes = (task.notes || '').toLowerCase()
    if (title.includes('work') || title.includes('release') || title.includes('code') || title.includes('bug') || title.includes('job') || title.includes('office') || title.includes('client') || notes.includes('meeting')) {
      return 'Work'
    }
    if (title.includes('gym') || title.includes('run') || title.includes('health') || title.includes('sleep') || title.includes('workout') || title.includes('meditat') || title.includes('doctor')) {
      return 'Health'
    }
    if (title.includes('study') || title.includes('read') || title.includes('learn') || title.includes('course') || title.includes('book') || title.includes('tutorial')) {
      return 'Learning'
    }
    return 'Personal'
  }

  const categories: Record<string, number> = { Work: 0, Personal: 0, Health: 0, Learning: 0 }
  let totalCategorized = 0

  const allTasks = [...activeTasks, ...completedTasks]
  allTasks.forEach((task) => {
    const cat = getCategory(task)
    categories[cat] += 1
    totalCategorized += 1
  })

  // Colors mapping
  const catColors: Record<string, string> = {
    Work: '#38bdf8',    // sky blue
    Personal: '#a855f7', // purple
    Health: '#10b981',   // emerald
    Learning: '#f59e0b'  // amber
  }

  // Calculate Donut circle strokes
  let accumulatedPercent = 0
  const donutRadius = 35
  const donutCircumference = 2 * Math.PI * donutRadius

  const segments = Object.entries(categories).map(([name, count]) => {
    const percent = totalCategorized > 0 ? count / totalCategorized : 0.25 // equal defaults if empty
    const strokeDasharray = `${percent * donutCircumference} ${donutCircumference}`
    const strokeDashoffset = -accumulatedPercent * donutCircumference
    accumulatedPercent += percent
    return { name, count, percent, strokeDasharray, strokeDashoffset, color: catColors[name] }
  })

  return (
    <section className="panel analytics">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Signals</p>
          <h2>Analytics</h2>
          <p className="panel-subtitle">Visual highlights of your recent productivity.</p>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Open" value={analytics.openTasks} />
        <MetricCard label="Overdue" value={analytics.overdueTasks} />
        <MetricCard label="Focus min" value={analytics.remainingFocusMinutes} />
        <MetricCard label="Done" value={analytics.completedTasks} />
      </div>

      <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Productivity Waveform (Last 7 Days)
        </h3>
        
        {/* SVG Area Line Chart */}
        <div className="chart-container">
          <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.00" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Filled Area */}
            {points.length > 0 && (
              <path d={areaPath} fill="url(#areaGrad)" />
            )}

            {/* Line */}
            {points.length > 0 && (
              <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
            )}

            {/* Dots */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="4" fill="var(--surface-solid)" stroke="var(--accent)" strokeWidth="2" />
                {p.count > 0 && (
                  <text x={p.x} y={p.y - 8} textAnchor="middle" fill="var(--accent)" fontSize="8" fontWeight="800">
                    {p.count}
                  </text>
                )}
                <text x={p.x} y={height - 2} textAnchor="middle" fill="var(--subtle)" fontSize="8" fontWeight="600">
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Category Distribution
        </h3>

        {/* SVG Donut Chart */}
        <div className="donut-chart-box">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="10"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
              />
            ))}
            <circle cx="50" cy="50" r="28" fill="var(--surface-solid)" />
            <text x="50" y="54" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text)">
              {totalCategorized} total
            </text>
          </svg>

          <div className="donut-legend">
            {segments.map((seg, idx) => (
              <div className="legend-item" key={idx}>
                <div className="legend-dot" style={{ backgroundColor: seg.color }} />
                <span style={{ fontWeight: 600 }}>{seg.name}:</span>
                <span style={{ color: 'var(--muted)' }}>
                  {seg.count} ({Math.round(seg.percent * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
