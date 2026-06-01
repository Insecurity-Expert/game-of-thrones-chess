import random
import chess

BACK_ROW = ['K','Q','R','R','B','B','N','N',]

def _scrambled_rank(white):
    pieces = BACK_ROW[:]
    random.shuffle(pieces)
    if not white:
        pieces = [p.lower() for p in pieces]
    return pieces

def create_new_game():
    black_back = _scrambled_rank(white=False)
    white_back = _scrambled_rank(white=True)

    fen = (
        ''.join(black_back) + '/' +
        'pppppppp' + '/' +
        '8/8/8/8' + '/' +
        'PPPPPPPP'+ '/' +
        ''.join(white_back) +
        ' w - - 0 1'
    )
    return chess.Board(fen)

def get_legal_moves(board):
    moves = []
    for move in board.pseudo_legal_moves:
        if board.is_castling(move):
            continue
        if board.is_en_passant(move):
            continue
        if move.promotion is not None and move.promotion != chess.QUEEN:
            continue
        moves.append(move)
    return moves

def is_game_over(board):
    return board.king(chess.WHITE) is None or board.king(chess.BLACK) is None

def get_winner(board):
    if board.king(chess.WHITE) is None:
        return 'black'
    if board.king(chess.BLACK) is None:
        return 'white'
    return None

def apply_move(board,move):
    board.push(move)
    return board




