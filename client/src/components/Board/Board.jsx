import useGameStore from '../../store/gameStore'
import gamePhase from '../../store/gameStore'
import Square from './Square'

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]

export default function Board() {
    const { boardState, selectedSquare, handleSquareClick, legalMoves, difficulty, deductions, gamePhase } =
        useGameStore()

    const fogOn = difficulty !== 'easy' && gamePhase !== 'gameover'
    const showDeductions = difficulty !== 'hard'

    return (
        <div className="grid grid-cols-8 border-2 border-yellow-800">
            {ranks.map((rank) =>
                files.map((file) => {
                    const square = `${file}${rank}`
                    const isLight = (files.indexOf(file) + rank) % 2 === 0
                    const piece = boardState.find((p) => p.square === square) || null
                    const isSelected = selectedSquare === square
                    const isLegalDestination = !!selectedSquare && legalMoves.includes(selectedSquare + square)
                    const isHidden = fogOn && piece && piece.color === 'black'
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