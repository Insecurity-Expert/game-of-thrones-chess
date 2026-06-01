// Background music controller. Single shared <audio> element across the app.

let audio = null
let muted = false
const STORAGE_KEY = 'got-chess-muted'

function init() {
  if (audio) return audio
  audio = new Audio('/music/background.mp3')
  audio.loop = true
  audio.volume = 0.25  // quiet background level

  muted = localStorage.getItem(STORAGE_KEY) === 'true'
  audio.muted = muted
  return audio
}

export function startMusic() {
  const a = init()
  a.play().catch(() => {
    // autoplay blocked until a user click — fine, will work on next try
  })
}

export function stopMusic() {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

export function toggleMute() {
  init()
  muted = !muted
  audio.muted = muted
  localStorage.setItem(STORAGE_KEY, String(muted))
  return muted
}

export function isMuted() {
  init()
  return muted
}