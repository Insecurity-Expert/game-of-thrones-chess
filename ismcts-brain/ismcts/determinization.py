import random
import chess

ALL_TYPES = {'K','Q','R','B','N',}
PIECE_CAPS = {'K': 1,'Q': 1, 'R': 2, 'B' : 2, 'N' : 2}
PIECE_TYPE = {
    'K': chess.KING, 'Q': chess.QUEEN, 'R' : chess.ROOK, 'B' : chess.BISHOP, 'N' : chess.KNIGHT
}

def _types_for_step(df,dr):
    adf, adr = abs(df), abs(dr)
    types = set()
    if (adf,adr) in [(1,2),(2,1)]:
        types.add('N')
    if adf == adr and adf > 0: 
        types.update(['B','Q'])
        if adf == 1:
            types.add('K')
    if (adf == 0) != (adr == 0):
        types.update(['R','Q'])
        if max(adf, adr) == 1:
            types.add('K')
    return types

def _candidates_from_path(path):
    """Intersect the possibilities across every step this piece has taken."""
    cands = set(ALL_TYPES)
    for a, b in zip(path, path[1:]):
        df = chess.square_file(b) - chess.square_file(a)
        dr = chess.square_rank(b) - chess.square_rank(a)
        cands &= _types_for_step(df, dr)
    return cands

def _origin_map(board):
    root = board.root()
    origin = {sq: sq for sq in chess.SQUARES if root.piece_at(sq)}
    paths = {sq: [sq] for sq in origin}
    for move in board.move_stack:
        frm, to = move.from_square, move.to_square
        start = origin.pop(frm)
        if to in origin:
            captured = origin.pop(to)
            paths.pop(captured, None)
        origin[to] = start
        paths[start].append(to)
    return origin, paths

def _assign(hidden):
    order = sorted(range(len(hidden)), key= lambda i: len(hidden[i][1]))
    counts = {t: 0 for t in PIECE_CAPS}
    result = {}

    def backtrack(k):
        if k == len(order):
            return counts ['K'] == 1
        sq, cands = hidden[order[k]]
        options = list(cands)
        random.shuffle(options)
        for t in options:
            if counts[t] < PIECE_CAPS[t]:
                counts[t] += 1
                result[sq] = t
                if backtrack(k+1):
                    return True
                counts[t] -= 1
                del result[sq]
        return False
    return result if backtrack(0) else None

def create_determinization(board, ai_color):
    opponent = not ai_color
    origin, paths = _origin_map(board)

    hidden = []
    for sq in chess.SQUARES:
        piece = board.piece_at(sq)
        if piece is None or piece.color != opponent:
            continue
        if piece.piece_type == chess.PAWN:
            continue
        hidden.append((sq, _candidates_from_path(paths[origin[sq]])))

    assignment = _assign(hidden)
    det = board.copy()
    if assignment is not None:
        for sq, t in assignment.items():
            det.set_piece_at(sq, chess.Piece(PIECE_TYPE[t], opponent))
    return det
    
if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import game

    board = game.create_new_game()
    for _ in range(12):                      # play a few random moves so pieces have moved
        moves = game.get_legal_moves(board)
        if not moves:
            break
        board.push(random.choice(moves))

    det = create_determinization(board, chess.BLACK)   # Black guesses White's pieces
    print("TRUE BOARD:")
    print(board)
    print("\nBLACK'S GUESS OF WHITE'S HIDDEN PIECES:")
    print(det)

    white_kings = sum(
        1 for sq in chess.SQUARES
        if det.piece_at(sq)
        and det.piece_at(sq).piece_type == chess.KING
        and det.piece_at(sq).color == chess.WHITE
    )
    print(f"\nWhite kings in the guess: {white_kings}  (must be exactly 1)")

