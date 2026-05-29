import chess

PIECE_VALUE = {
    chess.PAWN: 1.0,
    chess.KNIGHT: 3.0,
    chess.BISHOP: 3.0,
    chess.ROOK: 5.0,
    chess.QUEEN: 9.0,
    chess.KING: 1000.0,
}

CENTER = {chess.D4, chess.E4, chess.D5, chess.E5}
CENTER_BONUS = 0.3

def evaluate_board(board,color):
    if board.king(color) is None:
        return float('-inf')
    if board.king(not color) is None:
        return float('inf')

    score = 0.0
    for sq, piece in board.piece_map().items():
        value = PIECE_VALUE[piece.piece_type]
        if sq in CENTER:
            value += CENTER_BONUS
        score += value if piece.color == color else -value
    return score

if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import game

    board = game.create_new_game()
    print("Fresh baord, White's perspective:", evaluate_board(board,chess.WHITE))

    for sq, p in list (board.piece_map().items()):
        if p.color == chess.WHITE and p.piece_type == chess.QUEEN:
            board.remove_piece_at(sq)
            break
    print("White loses its queen:               ", evaluate_board(board, chess.WHITE))

    board.remove_piece_at(board.king(chess.BLACK))
    print("After Black's king is captured:          ", evaluate_board(board, chess.WHITE))