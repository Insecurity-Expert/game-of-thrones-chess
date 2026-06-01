import useGameStore from '../../store/gameStore'
import Square from './Square'

const FILES_DEFAULT = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS_DEFAULT = [8, 7, 6, 5, 4, 3, 2, 1]

export default function Board() {
    const {
        boardState, selectedSquare, handleSquareClick, legalMoves,
        difficulty, deductions, gamePhase, playerColor, aiColor,
    } = useGameStore()

    const fogOn = difficulty !== 'easy' && difficulty !== 'dev' && gamePhase !== 'gameover'
    const showDeductions = difficulty !== 'hard'

    // Flip the rendering order when the player is Black
    const files = playerColor === 'white' ? FILES_DEFAULT : [...FILES_DEFAULT].reverse()
    const ranks = playerColor === 'white' ? RANKS_DEFAULT : [...RANKS_DEFAULT].reverse()

    return (
        <div className="grid grid-cols-8 border-2 border-yellow-800">
            {ranks.map((rank) =>
                files.map((file) => {
                    const square = `${file}${rank}`
                    // Use FILES_DEFAULT for indexOf so square colors stay correct regardless of orientation
                    const isLight = (FILES_DEFAULT.indexOf(file) + rank) % 2 === 0
                    const piece = boardState.find((p) => p.square === square) || null
                    const isSelected = selectedSquare === square

                    const baseMove = selectedSquare + square
                    const isLegalDestination = !!selectedSquare && (
                        legalMoves.includes(baseMove) || ['q','r','b','n'].some(s => legalMoves.includes(baseMove + s))
                    )

                    const isHidden = fogOn && piece && piece.color === aiColor
                    const deduction = deductions[square]

                    return (
                        <Square
                            key={square}
                            square={square}
                            isLight={isLight}
                            piece={piece}
                            isSelected={isSelected}
                            isLegalDestination={isLegalDestination}
                            isHidden={isHidden}
                            deduction={deduction}
                            showDeductions={showDeductions}
                            onClick={() => handleSquareClick(square)}
                        />
                    )
                })
            )}
        </div>
    )
}