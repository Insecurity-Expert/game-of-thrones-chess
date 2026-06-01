import useGameStore from '../../store/gameStore'
import { newGame } from '../../utils/api'
import { fenToBoard } from '../../utils/fen'

export default function GameOverModal() {
    const {
        winner, movesHistory, difficulty, resetGame,
        setDifficulty, initFromServer, setBoard, setGamePhase,
        playerColor,
    } = useGameStore()

    const playerWon = winner === playerColor
    const heading = playerWon ? 'VICTORY' : 'DEFEAT'
    const subtext = playerWon
        ? "You captured the AI's king."
        : 'The AI captured your king.'
    const color = playerWon ? 'text-yellow-500' : 'text-red-700'

    const handlePlayAgain = async () => {
        const keepDifficulty = difficulty
        const keepColor = playerColor
        resetGame()
        setDifficulty(keepDifficulty)
        const data = await newGame()
        initFromServer(data, keepColor)
        setBoard(fenToBoard(data.initial_fen))
        setGamePhase('playing')
        if (keepColor === 'black') {
            await useGameStore.getState()._fetchAiMove([])
        }
    }

    const handleBackToMenu = () => {
        resetGame()
    }

    return (
        <div className="bg-[#1a1a1a] border-2 border-yellow-900 rounded-lg p-4 w-64 flex flex-col items-center gap-3">
            <h1 className={`text-3xl font-black ${color} tracking-widest uppercase`}>
                {heading}
            </h1>
            <p className="text-gray-400 text-xs text-center">{subtext}</p>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest text-center">
                <div>Total moves: {movesHistory.length}</div>
                <div>Difficulty: {difficulty}</div>
                <div>You played: {playerColor}</div>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
                <button
                    onClick={handlePlayAgain}
                    className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded uppercase tracking-widest text-xs"
                >
                    Play Again
                </button>
                <button
                    onClick={handleBackToMenu}
                    className="w-full py-2 border border-gray-600 text-gray-300 hover:border-gray-400 font-bold rounded uppercase tracking-widest text-xs"
                >
                    Main Menu
                </button>
            </div>
        </div>
    )
}