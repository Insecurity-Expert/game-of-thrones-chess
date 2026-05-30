import { create } from 'zustand'
import { requestAiMove } from '../utils/api'
import { fenToBoard } from '../utils/fen'

const DIFFICULTY_TIME = { easy: 3.0, medium: 10.0, hard: 20.0 }

const useGameStore = create((set, get) => ({
    // ----- state -----
    boardState: [],
    currentTurn: 'player',
    selectedSquare: null,
    revealedPieces: [],
    gamePhase: 'menu',
    difficulty: null,
    winner: null,
    moveHistory: [],
    initialFen: null,
    movesHistory: [],
    deductions: {},
    legalMoves: [],
    aiThinking: false,

    // ----- simple setters -----
    setBoard: (board) => set({ boardState: board }),
    selectSquare: (square) => set({ selectedSquare: square }),
    setTurn: (turn) => set({ currentTurn: turn }),
    setDifficulty: (level) => set({ difficulty: level }),
    setGamePhase: (phase) => set({ gamePhase: phase }),
    revealPiece: (square) => set((state) => ({
        revealedPieces: [...state.revealedPieces, square]
    })),
    addMove: (move) => set((state) => ({
        moveHistory: [...state.moveHistory, move]
    })),
    endGame: (winner) => set({ winner, gamePhase: 'gameover' }),
    resetGame: () => set({
        boardState: [], currentTurn: 'player', selectedSquare: null,
        revealedPieces: [], gamePhase: 'menu', winner: null, moveHistory: [],
        initialFen: null, movesHistory: [], deductions: {}, legalMoves: [],
        aiThinking: false,
    }),

    initFromServer: ({ initial_fen, deductions, legal_moves }) => set({
        initialFen: initial_fen,
        movesHistory: [],
        deductions,
        legalMoves: legal_moves,
    }),

    // ----- click + move logic -----
    handleSquareClick: async (clickedSquare) => {
        const state = get()
        if (state.currentTurn !== 'player' || state.gamePhase !== 'playing') return

        const piece = state.boardState.find(p => p.square === clickedSquare)

        if (state.selectedSquare === null) {
            if (piece && piece.color === 'white') {
                set({ selectedSquare: clickedSquare })
            }
            return
        }

        if (clickedSquare === state.selectedSquare) {
            set({ selectedSquare: null })
            return
        }

        const moveUci = state.selectedSquare + clickedSquare
        if (state.legalMoves.includes(moveUci)) {
            await get()._executeMove(moveUci)
            return
        }

        // Not legal — maybe selecting a different own piece
        if (piece && piece.color === 'white') {
            set({ selectedSquare: clickedSquare })
        } else {
            set({ selectedSquare: null })
        }
    },

    _executeMove: async (moveUci) => {
        const state = get()
        const fromSquare = moveUci.slice(0, 2)
        const toSquare = moveUci.slice(2, 4)

        // Apply human move locally for instant feedback
        const movingPiece = state.boardState.find(p => p.square === fromSquare)
        const newBoard = state.boardState
            .filter(p => p.square !== fromSquare && p.square !== toSquare)
            .concat({ ...movingPiece, square: toSquare })

        const newMoves = [...state.movesHistory, moveUci]

        set({
            boardState: newBoard,
            movesHistory: newMoves,
            selectedSquare: null,
            currentTurn: 'ai',
            legalMoves: [],
            aiThinking: true,
        })

        // Ask the AI for its response
        const data = await requestAiMove({
            initialFen: state.initialFen,
            moves: newMoves,
            aiColor: 'black',
            timeLimit: DIFFICULTY_TIME[state.difficulty] || 3.0,
        })

        const updatedMoves = data.move ? [...newMoves, data.move] : newMoves

        set({
            boardState: fenToBoard(data.fen),
            movesHistory: updatedMoves,
            deductions: data.deductions || {},
            legalMoves: data.legal_moves || [],
            currentTurn: 'player',
            aiThinking: false,
        })

        if (data.game_over) {
            set({ gamePhase: 'gameover', winner: data.winner })
        }
    },
}))

export default useGameStore