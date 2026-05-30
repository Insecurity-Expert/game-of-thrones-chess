const FILES = ['a','b','c','d','e','f','g','h']

export function fenToBoard(fen) {
    const board = []
    const boardPart = fen.split(' ')[0]
    const ranks = boardPart.split('/')
    ranks.forEach((rank, rankIdx) => {
        let fileIdx = 0
        for (const ch of rank) {
            if (/\d/.test(ch)){
                fileIdx += parseInt(ch, 10)
                continue
            }
            const color = ch === ch.toUpperCase() ? 'white':'black'
            const type = ch.toUpperCase()
            const square = FILES[fileIdx] + (8 - rankIdx)
            board.push({square, type, color})
            fileIdx += 1
        }
    })
    return board
}