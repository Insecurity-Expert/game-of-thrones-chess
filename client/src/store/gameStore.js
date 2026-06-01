import { create } from 'zustand'
import { requestAiMove } from '../utils/api'
import { fenToBoard } from '../utils/fen'
import { playMove, playCapture, playVictory, playDefeat } from '../utils/sounds'

const DIFFICULTY_TIME = { easy: 3.0, medium: 10.0, hard: 20.0, dev:0.0 }

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
    playerColor: 'white',
    aiColor: 'black',
    promotionPending: null,

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
        aiThinking: false, playerColor: 'white', aiColor: 'black',
        promotionPending: null,
    }),

    initFromServer: (data, playerColor = 'white') => {
        const aiColor = playerColor === 'white' ? 'black' : 'white'
        set({
            initialFen: data.initial_fen,
            movesHistory: [],
            deductions: data.deductions || {},
            legalMoves: data.legal_moves || [],
            playerColor,
            aiColor,
            currentTurn: playerColor === 'white' ? 'player' : 'ai',
        })
    },

    // ----- click + move logic -----
    handleSquareClick: async (clickedSquare) => {
        const state = get()
        if (state.currentTurn !== 'player' || state.gamePhase !== 'playing') return
        if (state.promotionPending) return

        const piece = state.boardState.find(p => p.square === clickedSquare)

        if (state.selectedSquare === null) {
            if (piece && piece.color === state.playerColor) {
                set({ selectedSquare: clickedSquare })
            }
            return
        }

        if (clickedSquare === state.selectedSquare) {
            set({ selectedSquare: null })
            return
        }

    const baseMove = state.selectedSquare + clickedSquare

    // Detect promotion — if any q/r/b/n variant is in legal moves, open the picker
    const promoSuffixes = ['q', 'r', 'b', 'n']
    const promoExists = promoSuffixes.some(s => state.legalMoves.includes(baseMove + s))

    if (promoExists) {
        set({ promotionPending: { from: state.selectedSquare, to: clickedSquare } })
        return
    }

    if (state.legalMoves.includes(baseMove)) {
        await get()._executeMove(baseMove)
        return
    }

    if (piece && piece.color === state.playerColor) {
        set({ selectedSquare: clickedSquare })
    } else {
        set({ selectedSquare: null })
    }
},

    _executeMove: async (moveUci) => {
        const state = get()
        const fromSquare = moveUci.slice(0, 2)
        const toSquare = moveUci.slice(2, 4)
        const isPromotion = moveUci.length === 5

        const humanCaptured = state.boardState.some(p => p.square === toSquare)
        humanCaptured ? playCapture() : playMove()

        const movingPiece = state.boardState.find(p => p.square === fromSquare)
        const placedType = isPromotion ? 'Q' : movingPiece.type
        const newBoard = state.boardState
            .filter(p => p.square !== fromSquare && p.square !== toSquare)
            .concat({ ...movingPiece, type: placedType, square: toSquare })

        const newMoves = [...state.movesHistory, moveUci]

        set({
            boardState: newBoard,
            movesHistory: newMoves,
            selectedSquare: null,
        })

        await get()._fetchAiMove(newMoves)
    },

    _fetchAiMove: async (movesBeforeAi) => {
    const state = get()
    set({ aiThinking: true, currentTurn: 'ai', legalMoves: [] })

    try {
        const data = await requestAiMove({
            initialFen: state.initialFen,
            moves: movesBeforeAi,
            aiColor: state.aiColor,
            timeLimit: DIFFICULTY_TIME[state.difficulty] || 3.0,
            devMode: state.difficulty === 'dev',
        })

        const updatedMoves = data.move ? [...movesBeforeAi, data.move] : movesBeforeAi
        const finalBoard = fenToBoard(data.fen)

        const boardBeforeAi = get().boardState
        const aiCaptured = finalBoard.length < boardBeforeAi.length
        aiCaptured ? playCapture() : playMove()

        set({
            boardState: finalBoard,
            movesHistory: updatedMoves,
            deductions: data.deductions || {},
            legalMoves: data.legal_moves || [],
            currentTurn: 'player',
            aiThinking: false,
        })

        if (data.game_over) {
            const playerWon = data.winner === get().playerColor
            playerWon ? playVictory() : playDefeat()
            set({ gamePhase: 'gameover', winner: data.winner })
        }
    } catch (err) {
        console.error('AI move request failed:', err)
        // Restore the player's turn so the UI doesn't freeze forever
        set({
            currentTurn: 'player',
            aiThinking: false,
            legalMoves: state.legalMoves,
        })
    }
},
}))

export default useGameStore