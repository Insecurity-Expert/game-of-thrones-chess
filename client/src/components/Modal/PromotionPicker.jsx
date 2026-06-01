import useGameStore from '../../store/gameStore'

const PIECES = [
    { type: 'q', symbol: { white: '♕', black: '♛' }, label: 'Queen' },
    { type: 'r', symbol: { white: '♖', black: '♜' }, label: 'Rook' },
    { type: 'b', symbol: { white: '♗', black: '♝' }, label: 'Bishop' },
    { type: 'n', symbol: { white: '♘', black: '♞' }, label: 'Knight' },
]

export default function PromotionPicker() {
    const promotionPending = useGameStore(s => s.promotionPending)
    const playerColor = useGameStore(s => s.playerColor)

    if (!promotionPending) return null

    const handlePick = async (type) => {
        const moveUci = promotionPending.from + promotionPending.to + type
        useGameStore.setState({ promotionPending: null, selectedSquare: null })
        await useGameStore.getState()._executeMove(moveUci)
    }

    const handleCancel = () => {
        useGameStore.setState({ promotionPending: null, selectedSquare: null })
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={handleCancel}
        >
            <div
                className="bg-[#1a1a1a] border-2 border-yellow-600 rounded-lg p-6 flex flex-col items-center gap-4"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-yellow-500 text-sm uppercase tracking-widest">Choose Promotion</h3>
                <div className="flex gap-3">
                    {PIECES.map(({ type, symbol, label }) => (
                        <button
                            key={type}
                            onClick={() => handlePick(type)}
                            className="flex flex-col items-center gap-1 px-4 py-3 bg-[#2a2a2a] hover:bg-yellow-600 hover:text-black text-white rounded-lg border border-yellow-900 transition-colors"
                        >
                            <span className="text-4xl">{symbol[playerColor]}</span>
                            <span className="text-xs uppercase tracking-wide">{label}</span>
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 italic">Click outside to cancel</p>
            </div>
        </div>
    )
}