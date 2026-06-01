"""
evaluator.py — Chess heuristic with material + piece-square tables (PSTs).

Each piece type has an 8x8 table of positional bonuses for being on each square.
Knights prefer the center, rooks prefer the 7th rank, kings prefer the back rank
in the middlegame, etc. These are the well-known "simplified evaluation" PSTs
from the chess programming community, scaled to match our material values.
"""

import chess

# Standard piece values. King is huge — short-circuit handles actual capture.
PIECE_VALUE = {
    chess.PAWN:   1.0,
    chess.KNIGHT: 3.0,
    chess.BISHOP: 3.0,
    chess.ROOK:   5.0,
    chess.QUEEN:  9.0,
    chess.KING:   1000.0,
}

# ---------- Piece-square tables ----------
# Tables are written from White's perspective. Index 0 = a1, 7 = h1, 56 = a8, 63 = h8.
# For Black pieces, we mirror vertically using chess.square_mirror.

PAWN_PST = [
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,    # rank 1 (never)
    0.05, 0.10, 0.10,-0.20,-0.20, 0.10, 0.10, 0.05,    # rank 2 (start)
    0.05,-0.05,-0.10, 0.00, 0.00,-0.10,-0.05, 0.05,    # rank 3
    0.00, 0.00, 0.00, 0.20, 0.20, 0.00, 0.00, 0.00,    # rank 4
    0.05, 0.05, 0.10, 0.25, 0.25, 0.10, 0.05, 0.05,    # rank 5
    0.10, 0.10, 0.20, 0.30, 0.30, 0.20, 0.10, 0.10,    # rank 6
    0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50,    # rank 7 (about to promote)
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,    # rank 8
]

KNIGHT_PST = [
   -0.50,-0.40,-0.30,-0.30,-0.30,-0.30,-0.40,-0.50,
   -0.40,-0.20, 0.00, 0.05, 0.05, 0.00,-0.20,-0.40,
   -0.30, 0.05, 0.10, 0.15, 0.15, 0.10, 0.05,-0.30,
   -0.30, 0.00, 0.15, 0.20, 0.20, 0.15, 0.00,-0.30,
   -0.30, 0.05, 0.15, 0.20, 0.20, 0.15, 0.05,-0.30,
   -0.30, 0.00, 0.10, 0.15, 0.15, 0.10, 0.00,-0.30,
   -0.40,-0.20, 0.00, 0.00, 0.00, 0.00,-0.20,-0.40,
   -0.50,-0.40,-0.30,-0.30,-0.30,-0.30,-0.40,-0.50,
]

BISHOP_PST = [
   -0.20,-0.10,-0.10,-0.10,-0.10,-0.10,-0.10,-0.20,
   -0.10, 0.05, 0.00, 0.00, 0.00, 0.00, 0.05,-0.10,
   -0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10,-0.10,
   -0.10, 0.00, 0.10, 0.10, 0.10, 0.10, 0.00,-0.10,
   -0.10, 0.05, 0.05, 0.10, 0.10, 0.05, 0.05,-0.10,
   -0.10, 0.00, 0.05, 0.10, 0.10, 0.05, 0.00,-0.10,
   -0.10, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,-0.10,
   -0.20,-0.10,-0.10,-0.10,-0.10,-0.10,-0.10,-0.20,
]

ROOK_PST = [
    0.00, 0.00, 0.00, 0.05, 0.05, 0.00, 0.00, 0.00,
   -0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,-0.05,
   -0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,-0.05,
   -0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,-0.05,
   -0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,-0.05,
   -0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,-0.05,
    0.05, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.05,    # 7th rank is great for rooks
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
]

QUEEN_PST = [
   -0.20,-0.10,-0.10,-0.05,-0.05,-0.10,-0.10,-0.20,
   -0.10, 0.00, 0.05, 0.00, 0.00, 0.00, 0.00,-0.10,
   -0.10, 0.05, 0.05, 0.05, 0.05, 0.05, 0.00,-0.10,
    0.00, 0.00, 0.05, 0.05, 0.05, 0.05, 0.00,-0.05,
   -0.05, 0.00, 0.05, 0.05, 0.05, 0.05, 0.00,-0.05,
   -0.10, 0.00, 0.05, 0.05, 0.05, 0.05, 0.00,-0.10,
   -0.10, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,-0.10,
   -0.20,-0.10,-0.10,-0.05,-0.05,-0.10,-0.10,-0.20,
]

KING_PST = [
    0.20, 0.30, 0.10, 0.00, 0.00, 0.10, 0.30, 0.20,    # rank 1: corners safest
    0.20, 0.20, 0.00, 0.00, 0.00, 0.00, 0.20, 0.20,
   -0.10,-0.20,-0.20,-0.20,-0.20,-0.20,-0.20,-0.10,
   -0.20,-0.30,-0.30,-0.40,-0.40,-0.30,-0.30,-0.20,
   -0.30,-0.40,-0.40,-0.50,-0.50,-0.40,-0.40,-0.30,
   -0.30,-0.40,-0.40,-0.50,-0.50,-0.40,-0.40,-0.30,
   -0.30,-0.40,-0.40,-0.50,-0.50,-0.40,-0.40,-0.30,
   -0.30,-0.40,-0.40,-0.50,-0.50,-0.40,-0.40,-0.30,    # rank 8: very dangerous
]

PST = {
    chess.PAWN:   PAWN_PST,
    chess.KNIGHT: KNIGHT_PST,
    chess.BISHOP: BISHOP_PST,
    chess.ROOK:   ROOK_PST,
    chess.QUEEN:  QUEEN_PST,
    chess.KING:   KING_PST,
}


def _pst_value(piece, square):
    """Positional bonus for piece at square. Mirrors the table for Black pieces."""
    idx = square if piece.color == chess.WHITE else chess.square_mirror(square)
    return PST[piece.piece_type][idx]


def evaluate_board(board, color):
    """Score the board from `color`'s point of view (+ good, - bad)."""
    # Game-ending short-circuits
    if board.king(color) is None:
        return float('-inf')
    if board.king(not color) is None:
        return float('inf')

    score = 0.0
    for sq, piece in board.piece_map().items():
        value = PIECE_VALUE[piece.piece_type] + _pst_value(piece, sq)
        score += value if piece.color == color else -value
    return score


# ---------- quick self-test: python chess_eval/evaluator.py ----------

if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import game

    board = game.create_new_game()
    print(f"Fresh board (symmetric, should be near 0): {evaluate_board(board, chess.WHITE):.2f}")

    # Remove White's queen — score should drop by ~9 (plus the queen's PST contribution)
    for sq, p in list(board.piece_map().items()):
        if p.color == chess.WHITE and p.piece_type == chess.QUEEN:
            board.remove_piece_at(sq)
            break
    print(f"White loses its queen (should be near -9): {evaluate_board(board, chess.WHITE):.2f}")

    # Capture Black's king — should be +infinity
    board.remove_piece_at(board.king(chess.BLACK))
    print(f"After Black's king is captured (should be inf): {evaluate_board(board, chess.WHITE):.2f}")