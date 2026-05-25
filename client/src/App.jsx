import useGameStore from './store/gameStore'
import MenuModal from './components/Modal/MenuModal'
import Board from './components/Board/Board'
import GameInfo from './components/GameInfo/GameInfo'

export default function App() {
  const { gamePhase } = useGameStore()

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      
      {/* Main Menu */}
      {gamePhase === 'menu' && <MenuModal />}

      {/* Game Screen */}
      {gamePhase === 'playing' && (
        <div className="flex gap-8 items-start">
          <Board />
          <GameInfo />
        </div>
      )}

    </div>
  )
}