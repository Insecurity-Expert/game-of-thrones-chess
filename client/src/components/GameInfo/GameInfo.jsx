import useGameStore from '../../store/gameStore'

export default function GameInfo() {
  const { currentTurn, difficulty, movesHistory, aiThinking, gamePhase, resetGame } = useGameStore()

  return (
    <div className="flex flex-col gap-4 w-64 p-4 bg-[#1a1a1a] text-white rounded-lg border border-yellow-900">

      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Current Turn</span>
        <span className={`text-lg font-bold ${currentTurn === 'player' ? 'text-yellow-400' : 'text-red-500'}`}>
          {currentTurn === 'player' ? '⚔ Your Turn' : (aiThinking ? '🤖 AI Thinking...' : '🤖 AI Turn')}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Difficulty</span>
        <span className="text-sm font-semibold text-yellow-600 capitalize">
          {difficulty ?? 'Not selected'}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Move History</span>
        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          {movesHistory.length === 0 && (
            <span className="text-xs text-gray-600 italic">No moves yet</span>
          )}
          {movesHistory.map((uci, i) => {
            const from = uci.slice(0, 2)
            const to = uci.slice(2, 4)
            const who = i % 2 === 0 ? 'W' : 'B'
            return (
              <span key={i} className="text-xs text-gray-300">
                {Math.floor(i / 2) + 1}. <span className="text-yellow-700">{who}</span> {from} → {to}
              </span>
            )
          })}
        </div>
      </div>

      {gamePhase === 'playing' && (
        <button
          onClick={resetGame}
          className="mt-2 py-2 border border-red-900 text-red-500 hover:bg-red-900/30 rounded uppercase tracking-widest text-xs font-bold"
        >
          Quit Game
        </button>
      )}
    </div>
  )
}