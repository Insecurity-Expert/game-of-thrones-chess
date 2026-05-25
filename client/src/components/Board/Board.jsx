import useGameStore from '../../store/gameStore'
import Square from './Square'

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]

export default function Board() {
    const { boardState, selectedSquare, selectSquare } = useGameStore()

    return (
        <div className="grid grid-cols-8 border-2 border-yellow-800">
            {ranks.map((rank) => 
                files.map((file) => {
                    const square = '${file}${rank}'
                    const isLight = (files.indexOf(file) + rank) % 2 === 0
                    const piece = boardState.find((p) => p.square === square) || null
                    const isSelected = selectedSquare === square

                    return (
                        <Square
                            key = {square}
                            square = {square}
                            isLight = {isLight}
                            piece = {piece}
                            isSelected = {isSelected}
                            onClick = { () => selectSquare(square)}
                        />
                    )
                })
                
            )}
        </div>
         
    )

}