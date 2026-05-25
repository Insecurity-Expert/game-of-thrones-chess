import useGameStore from '../../store/gameStore'

export default function GameInfo(){
    const { currentTurn, difficulty, moveHistory} = useGameStore()

    return (
        <div className="flex flex-col gapt-4 w-64 p-4 bg[#1a1a1a] text-white rounded-lg border border-yellow-900">
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                    Current Turn
                </span>
                <span className={`text-lg font-bold ${currentTurn==='player' ? 'text-yellow-400' : 'text-red-500'}`}>
                    {currentTurn === 'player' ? '⚔ Your Turn' : '🤖 AI Thinking...'}
                </span>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                    Difficulty
                </span>
                <span className="text-sm font-semibold text-tellow-600 capitalize">
                    {difficulty ?? 'Not selected'}
                </span>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                    Move History
                </span>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                    {moveHistory.length === 0 && (
                        <span className="text-xs text-gray-600 italic">
                            No moves yet
                        </span>
                    )}

                    {moveHistory.map((move, i) => (
                        <span key={i} className="text-xs text-gray-300">
                            {i + 1}. {move.from} {'->'} {move.to}
                        </span>
                    
                    ))}
                </div>
            </div>
        </div>
    )
}