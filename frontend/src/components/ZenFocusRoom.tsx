import { useEffect, useRef, useState } from 'react'
import { Button, Slider, Typography } from 'antd'
import { Play, Pause, RotateCcw, X, Volume2, VolumeX, Sparkles } from 'lucide-react'
import type { Task } from '../types/task'

interface ZenFocusRoomProps {
  task: Task
  onClose: () => void
  onComplete: () => void
}

// Browser-native synthesizer class for distraction-free ambient sound
class AmbientSynth {
  private ctx: AudioContext | null = null
  private noiseNode: AudioBufferSourceNode | null = null
  private binauralLeft: OscillatorNode | null = null
  private binauralRight: OscillatorNode | null = null
  private warmPadOscs: OscillatorNode[] = []
  private filterNode: BiquadFilterNode | null = null
  private gainNode: GainNode | null = null
  private filterModulator: OscillatorNode | null = null

  start(type: 'rain' | 'binaural' | 'pad', volume: number) {
    this.stop()
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    this.ctx = new AudioContextClass()
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime)
    this.gainNode.connect(this.ctx.destination)

    if (type === 'rain') {
      // Create 2 seconds of random values for looping white noise
      const bufferSize = 2 * this.ctx.sampleRate
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      this.noiseNode = this.ctx.createBufferSource()
      this.noiseNode.buffer = noiseBuffer
      this.noiseNode.loop = true

      this.filterNode = this.ctx.createBiquadFilter()
      this.filterNode.type = 'lowpass'
      this.filterNode.frequency.setValueAtTime(380, this.ctx.currentTime)

      // Random slow modulator for wind gusts
      this.filterModulator = this.ctx.createOscillator()
      this.filterModulator.type = 'sine'
      this.filterModulator.frequency.setValueAtTime(0.12, this.ctx.currentTime)
      
      const modGain = this.ctx.createGain()
      modGain.gain.setValueAtTime(140, this.ctx.currentTime)

      this.filterModulator.connect(modGain)
      modGain.connect(this.filterNode.frequency)

      this.noiseNode.connect(this.filterNode)
      this.filterNode.connect(this.gainNode)

      this.filterModulator.start()
      this.noiseNode.start()
    } else if (type === 'binaural') {
      // Binaural beats (Left 140Hz, Right 144Hz -> 4Hz Delta wave)
      const merger = this.ctx.createChannelMerger(2)
      
      this.binauralLeft = this.ctx.createOscillator()
      this.binauralLeft.type = 'sine'
      this.binauralLeft.frequency.setValueAtTime(140, this.ctx.currentTime)

      this.binauralRight = this.ctx.createOscillator()
      this.binauralRight.type = 'sine'
      this.binauralRight.frequency.setValueAtTime(144, this.ctx.currentTime)

      const leftGain = this.ctx.createGain()
      const rightGain = this.ctx.createGain()
      leftGain.gain.setValueAtTime(0.5, this.ctx.currentTime)
      rightGain.gain.setValueAtTime(0.5, this.ctx.currentTime)

      this.binauralLeft.connect(leftGain)
      this.binauralRight.connect(rightGain)

      leftGain.connect(merger, 0, 0)
      rightGain.connect(merger, 0, 1)

      merger.connect(this.gainNode)

      this.binauralLeft.start()
      this.binauralRight.start()
    } else if (type === 'pad') {
      // Warm meditating drone (C2 - G2 - C3)
      const freqs = [65.41, 98.00, 130.81]
      
      freqs.forEach((freq) => {
        if (!this.ctx || !this.gainNode) return
        
        const osc = this.ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
        osc.detune.setValueAtTime(Math.random() * 10 - 5, this.ctx.currentTime)

        const filter = this.ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(220, this.ctx.currentTime)

        const oscGain = this.ctx.createGain()
        oscGain.gain.setValueAtTime(0.2, this.ctx.currentTime)

        osc.connect(filter)
        filter.connect(oscGain)
        oscGain.connect(this.gainNode)

        osc.start()
        this.warmPadOscs.push(osc)
      })
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime)
    }
  }

  playCompletionChime() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const chimeCtx = new AudioContextClass()
    const osc = chimeCtx.createOscillator()
    const gain = chimeCtx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, chimeCtx.currentTime) // C5
    osc.frequency.exponentialRampToValueAtTime(880.00, chimeCtx.currentTime + 0.3) // A5
    
    gain.gain.setValueAtTime(0.3, chimeCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, chimeCtx.currentTime + 1.2)

    osc.connect(gain)
    gain.connect(chimeCtx.destination)

    osc.start()
    osc.stop(chimeCtx.currentTime + 1.3)
  }

  stop() {
    try {
      if (this.noiseNode) this.noiseNode.stop()
      if (this.binauralLeft) this.binauralLeft.stop()
      if (this.binauralRight) this.binauralRight.stop()
      if (this.filterModulator) this.filterModulator.stop()
      this.warmPadOscs.forEach(osc => {
        try { osc.stop() } catch {}
      })
      this.warmPadOscs = []
      if (this.ctx) this.ctx.close()
    } catch (e) {
      // ignore
    }
    this.noiseNode = null
    this.binauralLeft = null
    this.binauralRight = null
    this.filterModulator = null
    this.ctx = null
  }
}

export function ZenFocusRoom({ task, onClose, onComplete }: ZenFocusRoomProps) {
  // Timer settings: fall back to 25 minutes if estimate is invalid, or use estimatedMinutes
  const totalSeconds = (task.estimatedMinutes && task.estimatedMinutes >= 5) ? task.estimatedMinutes * 60 : 25 * 60
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [soundType, setSoundType] = useState<'off' | 'rain' | 'binaural' | 'pad'>('off')
  const [volume, setVolume] = useState<number>(0.3)
  const [isMuted, setIsMuted] = useState<boolean>(false)

  const synthRef = useRef<AmbientSynth | null>(null)

  // Initialize Synth
  useEffect(() => {
    synthRef.current = new AmbientSynth()
    return () => {
      if (synthRef.current) {
        synthRef.current.stop()
      }
    }
  }, [])

  // Timer interval hook
  useEffect(() => {
    let interval: any = null
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1)
      }, 1000)
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false)
      if (synthRef.current) {
        synthRef.current.playCompletionChime()
      }
      onComplete()
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, secondsLeft, onComplete])

  // Audio settings sync
  useEffect(() => {
    if (!synthRef.current) return
    if (soundType === 'off' || isMuted) {
      synthRef.current.stop()
    } else {
      synthRef.current.start(soundType, volume)
    }
  }, [soundType, isMuted])

  // Volume sync
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setVolume(isMuted ? 0 : volume)
    }
  }, [volume, isMuted])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setSecondsLeft(totalSeconds)
  }

  // Circular progress calculations
  const progressPercent = (secondsLeft / totalSeconds) * 100
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
  }

  return (
    <div className="zen-overlay">
      <button className="zen-audio-btn" style={{ position: 'absolute', top: 24, right: 24, padding: 10, borderRadius: '50%' }} onClick={onClose}>
        <X size={20} />
      </button>

      <div className="zen-content">
        <header className="zen-header">
          <p>Zen Focus Mode</p>
          <h1>{task.title}</h1>
          {task.notes ? (
            <div className="zen-notes">{task.notes}</div>
          ) : (
            <Typography.Text type="secondary" style={{ color: '#64748b' }}>Immerse yourself and clear distractions.</Typography.Text>
          )}
        </header>

        {/* Circular SVG Timer */}
        <div className="zen-timer-container">
          <svg className="zen-timer-svg" width="220" height="220">
            <circle
              className="zen-timer-circle"
              cx="110"
              cy="110"
              r={radius}
            />
            <circle
              className="zen-timer-progress"
              cx="110"
              cy="110"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="zen-timer-text">{formatTime(secondsLeft)}</div>
        </div>

        {/* Timer Playback Buttons */}
        <div className="zen-controls">
          <Button
            type="primary"
            size="large"
            shape="round"
            icon={isActive ? <Pause size={16} /> : <Play size={16} />}
            onClick={toggleTimer}
            style={{ minWidth: 120, height: 48, background: '#38bdf8', color: '#0f172a' }}
          >
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button
            size="large"
            shape="round"
            icon={<RotateCcw size={16} />}
            onClick={resetTimer}
            style={{ height: 48, background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderColor: 'transparent' }}
          >
            Reset
          </Button>
          <Button
            type="dashed"
            size="large"
            shape="round"
            icon={<Sparkles size={16} />}
            onClick={onComplete}
            style={{ height: 48, color: '#34d399', borderColor: '#34d399', background: 'transparent' }}
          >
            Complete Now
          </Button>
        </div>

        {/* Breathing Assistive Prompt */}
        <div className="breathing-hint">
          {isActive ? 'Inhale peace... Exhale effort...' : 'Prepare your mind and press Start'}
        </div>

        {/* Ambient Sound Card */}
        <div className="zen-audio-card">
          <div className="zen-audio-label">Ambient Soundscape</div>
          <div className="zen-audio-list">
            {(['off', 'rain', 'binaural', 'pad'] as const).map((t) => (
              <button
                key={t}
                className={`zen-audio-btn ${soundType === t ? 'active' : ''}`}
                onClick={() => setSoundType(t)}
              >
                {t === 'off' ? 'Silence' : t === 'rain' ? 'Rain Noise' : t === 'binaural' ? 'Binaural' : 'Warm Pad'}
              </button>
            ))}
          </div>

          <div className="zen-volume-control">
            <button
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(val) => setVolume(val)}
              disabled={soundType === 'off' || isMuted}
              tooltip={{ formatter: (v) => `${Math.round((v || 0) * 100)}%` }}
              style={{ flex: 1, margin: '0 8px' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
