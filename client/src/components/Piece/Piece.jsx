import { Shield } from 'lucide-react'

const SYMBOLS = {
  white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
}

export default function Piece({ piece, isHidden }) {
  if (!piece) return null

  if (isHidden) {
    return (
      <Shield
        className="w-12 h-12 fill-slate-700 text-slate-300 drop-shadow-md"
        strokeWidth={2.5}
      />
    )
  }

  const symbol = SYMBOLS[piece.color]?.[piece.type]
  return (
    <span className={`text-4xl select-none ${piece.color === 'white' ? 'drop-shadow-md' : ''}`}>
      {symbol}
    </span>
  )
}