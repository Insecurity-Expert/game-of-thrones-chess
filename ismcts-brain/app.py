import time
import chess
from flask import Flask, request, jsonify
from flask_cors import CORS

import game
from ismcts.tree import ismcts
from ismcts.determinization import compute_all_deductions

app = Flask(__name__)
CORS(app)

def _build_deductions_payload(board):
    out = {}
    for sq, candidates in compute_all_deductions(board).items():
        if not candidates:
            continue
        prob = round(1.0/ len(candidates), 3)
        out[chess.square_name(sq)] = {t:prob for t in candidates}
    return out

def _legal_moves_uci(board):
    return [m.uci() for m in game.get_legal_moves(board)]

@app.route('/ai/new_game', methods=['POST'])
def new_game():
    board = game.create_new_game()
    return jsonify({
        'initial_fen': board.fen(),
        'fen': board.fen(),
        'deductions': _build_deductions_payload(board),
        'legal_moves': _legal_moves_uci(board),
    })

@app.route('/ai/move', methods=['POST'])
def make_move():
    data = request.get_json()
    initial_fen = data['initial_fen']
    moves = data.get('moves', [])
    ai_color_str = data.get('ai_color', 'black').lower()
    time_limit = float(data.get('time_limit', 3.0))

    # Replay history onto the scrambled starting position
    board = chess.Board(initial_fen)
    for uci in moves:
        board.push(chess.Move.from_uci(uci))

    # If the human's move already ended the game, return immediately —
    # don't ask the AI to "respond" on a king-less board.
    winner = game.get_winner(board)
    if winner is not None:
        return jsonify({
            'move': None,
            'fen': board.fen(),
            'iterations': 0,
            'think_time': 0.0,
            'game_over': True,
            'winner': winner,
            'deductions': _build_deductions_payload(board),
            'legal_moves': [],
        })

    ai_color = chess.WHITE if ai_color_str == 'white' else chess.BLACK

    start = time.time()
    move, iterations = ismcts(board, ai_color, time_limit_seconds=time_limit)
    think_time = round(time.time() - start, 2)

    board.push(move)
    winner = game.get_winner(board)

    return jsonify({
        'move': move.uci(),
        'fen': board.fen(),
        'iterations': iterations,
        'think_time': think_time,
        'game_over': winner is not None,
        'winner': winner,
        'deductions': _build_deductions_payload(board),
        'legal_moves': [] if winner is not None else _legal_moves_uci(board),
    })

if __name__=='__main__':
    app.run(host='0.0.0.0',port=5001, debug = True)