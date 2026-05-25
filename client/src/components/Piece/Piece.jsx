import { Shield } from 'lucide-react'

const SYMBOLS = {
    white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
}

export default function Piece ({piece}) {

    if(!piece) return null

    if (piece.type === 'SHIELD') {
        return (
            <Shield
                className = "w-10 h-10 text-slate-400 animate pulse"
                strokeWidth={1.5}
            />
        )
    }

    const symbol = SYMBOLS[piece.color]?.[piece.type]

    return(
        <span className={`text-4xl select-none ${piece.color === 'white' ? 'drop-shadow-md' : '' }`}>
            {symbol}
        </span>
    )
}