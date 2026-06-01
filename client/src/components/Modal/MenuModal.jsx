import { useState } from 'react'
import useGameStore from '../../store/gameStore'
import { newGame } from '../../utils/api'
import { fenToBoard } from '../../utils/fen'
import { startMusic } from '../../utils/music'

const difficulties = [
  { level: 'easy', label: 'Easy', time: '3 seconds', description: 'The AI thinks briefly. Season 8 Tier.' },
  { level: 'medium', label: 'Medium', time: '10 seconds', description: 'The AI thinks carefully. Hodor Tier.' },
  { level: 'hard', label: 'Hard', time: '20 seconds', description: 'The AI thinks deeply. Tyrion Tier.' },
  { level: 'dev', label: 'Dev', time: 'instant', description: 'Test Please Ignore'}
]

const sides = [
  { value: 'white', label: 'White', description: 'You move first.' },
  { value: 'black', label: 'Black', description: 'The AI moves first.' },
  { value: 'random', label: 'Random', description: 'A coin flip decides.' },
]

export default function MenuModal() {
  const { difficulty, setDifficulty, setGamePhase, setBoard, initFromServer } = useGameStore()
  const [side, setSide] = useState('white')

  const handleStart = async () => {
    if (!difficulty) return

    const chosenColor = side === 'random'
      ? (Math.random() < 0.5 ? 'white' : 'black')
      : side

    const data = await newGame()
    initFromServer(data, chosenColor)
    setBoard(fenToBoard(data.initial_fen))
    setGamePhase('playing')
    startMusic()

    if (chosenColor === 'black') {
      await useGameStore.getState()._fetchAiMove([])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 gap-6">
      <div className="text-center">
        <h1 className="text-6xl font-black text-yellow-500 tracking-widest uppercase">Game of Thrones</h1>
        <p className="text-gray-400 mt-2 tracking-widest text-sm uppercase">A Hidden-Strategy Chess Application</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Pick Your Side</span>
        <div className="flex gap-3">
          {sides.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setSide(value)}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-lg border-2 transition-all w-36
                ${side === value
                  ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 text-yellow-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
            >
              <span className="text-lg font-bold">{label}</span>
              <span className="text-[10px] text-gray-500 text-center">{description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Difficulty</span>
        <div className="flex gap-3">
          {difficulties.map(({ level, label, time, description }) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 transition-all w-44
                ${difficulty === level
                  ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 text-yellow-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
            >
              <span className="text-xl font-bold">{label}</span>
              <span className="text-xs text-gray-500">{time} thinking</span>
              <span className="text-xs text-center">{description}</span>
            </button>
          ))}
        </div>
      </div>

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