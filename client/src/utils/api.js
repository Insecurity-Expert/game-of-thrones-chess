const API_BASE = 'http://localhost:5001'

export async function newGame() {
  const res = await fetch(`${API_BASE}/ai/new_game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  return res.json()
}

export async function requestAiMove({ initialFen, moves, aiColor, timeLimit, devMode }) {
  const res = await fetch(`${API_BASE}/ai/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initial_fen: initialFen,
      moves,
      ai_color: aiColor,
      time_limit: timeLimit,
      dev_mode: devMode || false,
    }),
  })
  return res.json()
}