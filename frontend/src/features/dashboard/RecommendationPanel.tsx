import { useState, useRef } from 'react'
import type { Task } from '../../types/task'

export function RecommendationPanel({ task }: { task: Task | null | undefined }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Max rotation is 12 degrees
    const rX = -(y / (rect.height / 2)) * 8
    const rY = (x / (rect.width / 2)) * 8
    setCoords({ x: rY, y: rX })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setCoords({ x: 0, y: 0 })
  }

  return (
    <section
      ref={cardRef}
      className="recommendation"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg) translateZ(10px)` 
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: isHovered ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transformStyle: 'preserve-3d',
      }}
    >
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        <p className="eyebrow">AI recommendation</p>
        <h2>{task ? `Complete "${task.title}" first` : 'All tasks are complete'}</h2>
        <p>{task ? `Because ${task.aiReason}.` : 'Your board is clear. Add a task when the next priority appears.'}</p>
      </div>
      {task && (
        <div className="priority-meter" style={{ transform: 'translateZ(30px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <strong>{task.aiScore}</strong>
          <span>AI priority</span>
        </div>
      )}
    </section>
  )
}
