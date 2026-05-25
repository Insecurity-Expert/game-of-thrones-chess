import Piece from '../Piece/Piece'

export default function Square ({ square, isLight, piece, isSelected, onClick}) {
    const baseColor = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'
    const selectedStyle = isSelected ? 'ring-4 ring-inset ring-yellow-400' : ''

    return (
        <div
            className = {'relative w-16 h-16 flex items-center justify-center cursor-pointer ${baseColor} ${selectedStyle}'}
            onClick={onClick}
        >
            <Piece piece={piece}/>
        </div>
    )
}