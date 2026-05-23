import { create } from 'zustand'

const useGameStore = create((set) => ({
    boardState: [],
    currentTurn: 'player',
    selectedSquare: null,
    revealedPieces: [],
    gamePhase: 'menu',
    difficulty: null,
    winner: null,
    moveHistory: [],

    setBoard:(board) => set ({ boardState: board}),
    selectSquare:(square) => set ({selectedSquare: square}),
    setTurn:(turn) => set({ currentTurn: turn}),
    setDifficulty:(level) => set({ difficulty: level}),
    setGamePhase:(phase) => set({ gamePhase: phase}),
    revealPiece: (square) => set ((state) => ({
        revealedPieces: [...state.revealedPieces, square]
    })),
    addMove:(move) => set((state) => ({
        moveHistory: [...state.moveHistory, move]
    })),
    endGame:(winner) => set({ winner, gamePhase: 'gameover'}),
    resetGame: () => set({
        boardState: [],
        currentTurn: 'player',
        selectedSquare: null,
        revealedPieces: [],
        gamePhase: 'menu', 
        winner: null,
        moveHistory: [],
        }),
}))



export default useGameStore