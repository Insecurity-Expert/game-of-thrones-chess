import math
import time
import random
import chess

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import game
from ismcts.node import Node
from ismcts.determinization import create_determinization
from chess_eval.evaluator import evaluate_board

SIM_MOVE_CAP = 80

def ismcts(board, ai_color, time_limit_seconds):
    root = Node()
    deadline = time.time()+ time_limit_seconds
    iterations = 0

    while time.time() < deadline:
        det = create_determinization(board, ai_color)
        path = _select_and_expand(root, det)
        result = _simulate(det, ai_color)
        _backpropagate(path, result)
        iterations += 1
    
    if not root.children:
        return random.choice(game.get_legal_move(board)), 0
    return root.best_visited().move, iterations

def _select_and_expand(root, det):
    node = root
    path = [node]

    while True:
        if game.is_game_over(det):
            return path
        
        legal = game.get_legal_moves(det)
        if not legal:
            return path

        for c in node.children:
            if c.move in legal:
                c.availability_count += 1
        
        tried = {c.move for c in node.children}
        untried = [m for m in legal if m not in tried]

        if untried: 
            move = random.choice(untried)
            det.push(move)
            child = node.add_child(move)
            child.availability_count = 1
            path.append(child)
            return path

        legal_children = [c for c in node.children if c.move in legal]
        node = max(legal_children, key = lambda c: c.ucb_score())
        det.push(node.move)
        path.append(node)

SIM_PIECE_VALUE = {
    chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3,
    chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 100,
}

def _capture_gain(board, move):
    """Rough material gain from this capture (Most Valuable Victim - Least Valuable Attacker)."""
    target = board.piece_at(move.to_square)
    attacker = board.piece_at(move.from_square)
    if target is None or attacker is None:
        return 0
    return SIM_PIECE_VALUE[target.piece_type] - 0.1 * SIM_PIECE_VALUE[attacker.piece_type]


def _simulate(det, ai_color):
    board = det.copy()
    moves = 0
    while not game.is_game_over(board) and moves < SIM_MOVE_CAP:
        legal = game.get_legal_moves(board)
        if not legal:
            break
        captures = [m for m in legal if board.is_capture(m)]
        if captures:
            # Sort captures by material gain; pick a good one most of the time
            captures.sort(key=lambda m: _capture_gain(board, m), reverse=True)
            move = captures[0] if random.random() < 0.8 else random.choice(captures)
        else:
            move = random.choice(legal)
        board.push(move)
        moves += 1

    if game.is_game_over(board):
        winner = game.get_winner(board)
        ai_won = (winner == 'white' and ai_color == chess.WHITE) or (winner == 'black' and ai_color == chess.BLACK)
        return 1.0 if ai_won else 0.0

    score = evaluate_board(board, ai_color)
    return 1.0 / (1.0 + math.exp(-score/5.0))

def _backpropagate(path, result):
    for node in path:
        node.visit_count += 1
        node.win_score += result

if __name__ == "__main__":
    board = game.create_new_game()
    for _ in range(6):
        legal = game.get_legal_moves(board)
        if not legal:
            break
        board.push(random.choice(legal))

    print("Asking the AI (Black) to think for 3 seconds...")
    start = time.time()
    move, iters = ismcts(board, chess.BLACK, time_limit_seconds=3.0)
    print(f"\nChose: {move.uci()}")
    print(f"Iterations completed: {iters}")
    print(f"Time elapsed: {time.time() - start:.2f}s")
