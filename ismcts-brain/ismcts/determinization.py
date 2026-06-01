"""
determinization.py — Turn the foggy board into a concrete, plausible guess.

Promoted pawns are tracked as fresh pieces starting at the promotion square,
with candidates initialized to {Q, R, B, N} (no King) and narrowed by
post-promotion movement only.
"""

import random
import chess

ALL_TYPES = {'K', 'Q', 'R', 'B', 'N'}
PROMOTABLE_TYPES = {'Q', 'R', 'B', 'N'}   # pawn can promote to any of these, not K
PIECE_CAPS = {'K': 1, 'Q': 1, 'R': 2, 'B': 2, 'N': 2}
PIECE_TYPE = {
    'K': chess.KING, 'Q': chess.QUEEN, 'R': chess.ROOK,
    'B': chess.BISHOP, 'N': chess.KNIGHT,
}


# ---------- PART 1: what could a piece be, given one move it made? ----------

def _types_for_step(df, dr):
    """Which piece types could move with this file/rank delta? (geometry only)"""
    adf, adr = abs(df), abs(dr)
    types = set()
    if (adf, adr) in [(1, 2), (2, 1)]:
        types.add('N')
    if adf == adr and adf > 0:
        types.update(['B', 'Q'])
        if adf == 1:
            types.add('K')
    if (adf == 0) != (adr == 0):
        types.update(['R', 'Q'])
        if max(adf, adr) == 1:
            types.add('K')
    return types


def _candidates_from_path(path, is_promoted=False):
    """
    Intersect the possibilities across every step this piece has taken.
    Promoted pieces start from {Q, R, B, N} (no King is impossible).
    """
    cands = set(PROMOTABLE_TYPES) if is_promoted else set(ALL_TYPES)
    for a, b in zip(path, path[1:]):
        df = chess.square_file(b) - chess.square_file(a)
        dr = chess.square_rank(b) - chess.square_rank(a)
        cands &= _types_for_step(df, dr)
    return cands


# ---------- PART 2: follow every piece through the move history ----------

def _origin_map(board):
    """
    Replay the game to learn each piece's origin and path. Promotion events
    reset the piece: its origin becomes the promotion square, its path starts
    fresh, and it gets added to the `promoted` set.

    Returns: (origin, paths, promoted)
    """
    root = board.root()
    origin = {sq: sq for sq in chess.SQUARES if root.piece_at(sq)}
    paths = {sq: [sq] for sq in origin}
    promoted = set()

    for move in board.move_stack:
        frm, to = move.from_square, move.to_square
        start = origin.pop(frm)
        if to in origin:
            captured = origin.pop(to)
            paths.pop(captured, None)
            promoted.discard(captured)

        if move.promotion is not None:
            # Promotion: the pawn-era path is discarded; the new "piece" starts
            # at the promotion square.
            paths.pop(start, None)
            origin[to] = to
            paths[to] = [to]
            promoted.add(to)
        else:
            origin[to] = start
            paths[start].append(to)

    return origin, paths, promoted


# ---------- PART 3: assign one consistent set of identities ----------

def _assign(hidden):
    """
    hidden: list of (square, candidate_set). Pick a type for each square so that
    counts never exceed the real inventory and exactly one King is placed.
    """
    order = sorted(range(len(hidden)), key=lambda i: len(hidden[i][1]))
    counts = {t: 0 for t in PIECE_CAPS}
    result = {}

    def backtrack(k):
        if k == len(order):
            return counts['K'] == 1
        sq, cands = hidden[order[k]]
        options = list(cands)
        random.shuffle(options)
        for t in options:
            if counts[t] < PIECE_CAPS[t]:
                counts[t] += 1
                result[sq] = t
                if backtrack(k + 1):
                    return True
                counts[t] -= 1
                del result[sq]
        return False

    return result if backtrack(0) else None


# ---------- PART 4: put it together ----------

def create_determinization(board, ai_color):
    """Return a copy of the board with the opponent's hidden pieces guessed."""
    opponent = not ai_color
    origin, paths, promoted = _origin_map(board)

    hidden = []
    for sq in chess.SQUARES:
        piece = board.piece_at(sq)
        if piece is None or piece.color != opponent:
            continue
        if piece.piece_type == chess.PAWN:
            continue
        origin_sq = origin[sq]
        is_promoted = origin_sq in promoted
        hidden.append((sq, _candidates_from_path(paths[origin_sq], is_promoted=is_promoted)))

    assignment = _assign(hidden)
    det = board.copy()
    if assignment is not None:
        for sq, t in assignment.items():
            det.set_piece_at(sq, chess.Piece(PIECE_TYPE[t], opponent))
    return det


def compute_all_deductions(board):
    """
    Return {square: candidate_set} for every non-pawn hidden piece on the
    board. Promoted pieces start at {Q, R, B, N} and narrow by post-promotion
    movement only — not by the pre-promotion pawn moves.
    """
    origin, paths, promoted = _origin_map(board)
    deductions = {}
    for sq in chess.SQUARES:
        piece = board.piece_at(sq)
        if piece is None or piece.piece_type == chess.PAWN:
            continue
        origin_sq = origin[sq]
        is_promoted = origin_sq in promoted
        deductions[sq] = _candidates_from_path(paths[origin_sq], is_promoted=is_promoted)
    return deductions


# ---------- quick self-test: python determinization.py ----------

if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import game

    board = game.create_new_game()
    for _ in range(12):
        moves = game.get_legal_moves(board)
        if not moves:
            break
        board.push(random.choice(moves))

    det = create_determinization(board, chess.BLACK)
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