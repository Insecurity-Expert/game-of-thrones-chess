import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { toggleMute, isMuted } from '../../utils/music'

export default function MusicToggle() {
  const [muted, setMuted] = useState(isMuted())

  const handleClick = () => {
    const nowMuted = toggleMute()
    setMuted(nowMuted)
  }

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full shadow-lg transition-colors"
      title={muted ? 'Unmute music' : 'Mute music'}
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  )
}