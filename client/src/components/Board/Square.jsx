import { useState } from 'react'
import Piece from '../Piece/Piece'

const PIECE_NAMES = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight' }

export default function Square({
    square, isLight, piece, isSelected, isLegalDestination, isHidden,
    deduction, showDeductions, onClick,
}) {
    const [hover, setHover] = useState(false)
    const baseColor = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'
    const selectedStyle = isSelected ? 'ring-4 ring-inset ring-yellow-400' : ''
    const showTooltip = hover && showDeductions && deduction && piece

    return (
        <div
            className={`relative w-16 h-16 flex items-center justify-center cursor-pointer ${baseColor} ${selectedStyle}`}
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <Piece piece={piece} isHidden={isHidden} />
            {isLegalDestination && (
                <div className="absolute w-5 h-5 rounded-full bg-yellow-400 opacity-50 pointer-events-none" />
            )}
            {showTooltip && (
                <div className="absolute bottom-full mb-2 bg-gray-900 border border-yellow-700 rounded-md p-2 z-50 min-w-[120px] pointer-events-none shadow-lg">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        Possibilities
                    </div>
                    {Object.entries(deduction)
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, prob]) => (
                            <div key={type} className="flex justify-between text-xs text-white gap-3">
                                <span>{PIECE_NAMES[type]}</span>
                                <span className="font-semibold text-yellow-400">{Math.round(prob * 100)}%</span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    )
}