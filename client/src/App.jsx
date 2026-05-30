import useGameStore from './store/gameStore'
import MenuModal from './components/Modal/MenuModal'
import GameOverModal from './components/Modal/GameOverModal'
import Board from './components/Board/Board'
import GameInfo from './components/GameInfo/GameInfo'

export default function App() {
  const { gamePhase } = useGameStore()

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      {gamePhase === 'menu' && <MenuModal />}

      {(gamePhase === 'playing' || gamePhase === 'gameover') && (
        <div className="flex gap-8 items-start">
          <Board />
          <div className="flex flex-col gap-4">
            <GameInfo />
            {gamePhase === 'gameover' && <GameOverModal />}
          </div>
        </div>
      )}
    </div>
  )
}