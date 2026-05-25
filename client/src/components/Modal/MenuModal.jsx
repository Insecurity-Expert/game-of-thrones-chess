import useGameStore from '../../store/gameStore'

const difficulties = [
  { level: 'easy', label: 'Easy', time: '3 seconds', description: 'The AI thinks briefly. Good for beginners.' },
  { level: 'medium', label: 'Medium', time: '10 seconds', description: 'The AI thinks carefully. A fair challenge.' },
  { level: 'hard', label: 'Hard', time: '20 seconds', description: 'The AI thinks deeply. Expect no mercy.' },
]

export default function MenuModal() {
  const { difficulty, setDifficulty, setGamePhase } = useGameStore()

  const handleStart = () => {
    if (!difficulty) return
    setGamePhase('playing')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 gap-8">
      
      {/* Title */}
      <div className="text-center">
        <h1 className="text-6xl font-black text-yellow-500 tracking-widest uppercase">
          Game of Thrones
        </h1>
        <p className="text-gray-400 mt-2 tracking-widest text-sm uppercase">
          A Hidden-Strategy Chess Application
        </p>
      </div>

      {/* Difficulty Buttons */}
      <div className="flex gap-4">
        {difficulties.map(({ level, label, time, description }) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 transition-all w-44
              ${difficulty === level
                ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 text-yellow-400'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
          >
            <span className="text-xl font-bold">{label}</span>
            <span className="text-xs text-gray-500">{time} thinking</span>
            <span className="text-xs text-center">{description}</span>
          </button>
        ))}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={!difficulty}
        className="px-12 py-4 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black text-lg rounded-lg uppercase tracking-widest transition-all"
      >
        Start Game
      </button>

    </div>
  )
}