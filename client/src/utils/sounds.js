let audioCtx = null



function getCtx() {
    if (!audioCtx){
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtx
}

function playTone(frequency, duration, type = 'sine', gain = 0.2){
    try{
        const ctx = getCtx()
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = type
        osc.frequency.value = frequency
        g.gain.value = gain
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + duration / 1000)
    }
    catch (e){
        //browser blocked audio
    }
}

export function  playMove(){
    playTone(440, 90, 'triangle', 0.15)
}

export function playCapture() {
    playTone(180, 180, 'square', 0.25)
}

export function playVictory() {
    playTone(523, 180, 'triangle', 0.25)
    setTimeout(()=> playTone(659, 180,'triangle',0.25),180)
    setTimeout(()=> playTone(784, 400, 'triangle',0.25),360)
}

export function playDefeat() {
  playTone(440, 200, 'sawtooth', 0.2)          // A
  setTimeout(() => playTone(370, 200, 'sawtooth', 0.2), 200)    // F#
  setTimeout(() => playTone(247, 500, 'sawtooth', 0.2), 400)    // B (low)
}