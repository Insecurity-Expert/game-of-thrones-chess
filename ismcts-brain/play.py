"""
play.py — Command-line tester for the chess core (NO fog, full visibility).

Modes:
  python play.py        -> You (White) vs a random AI (Black)
  python play.py auto    -> Random vs random, played instantly to the end
"""

import sys
import random
import chess
import game


def print_board(board):
    """Print the board with rank numbers and file letters for orientation."""
    rows = str(board).split('\n')
    print()
    for i, row in enumerate(rows):
        rank = 8 - i          # str(board) goes from rank 8 down to rank 1
        print(f" {rank}  {row}")
    print("\n    a b c d e f g h\n")


def human_move(board):
    legal = game.get_legal_moves(board)
    legal_uci = sorted(m.uci() for m in legal)
    while True:
        print("Legal moves:", " ".join(legal_uci))
        text = input("Your move (e.g. e2e4), or 'q' to quit: ").strip().lower()
        if text == 'q':
            return None
        try:
            move = chess.Move.from_uci(text)
        except ValueError:
            print("  -> Not valid notation. Try again.\n")
            continue
        if move in legal:
            return move
        print("  -> That move isn't legal right now. Try again.\n")


def ai_move(board):
    move = random.choice(game.get_legal_moves(board))
    print(f"\nThe random AI plays: {move.uci()}")
    return move


def main():
    board = game.create_new_game()
    print("=" * 42)
    print(" GAME OF THRONES — core logic tester")
    print(" You are WHITE. The random AI is BLACK.")
    print(" Capture the enemy KING to win.")
    print("=" * 42)

    while not game.is_game_over(board):
        if not game.get_legal_moves(board):
            side = "White" if board.turn == chess.WHITE else "Black"
            print_board(board)
            print(f"\n{side} has no legal moves — draw.\n")
            return
        print_board(board)
        if board.turn == chess.WHITE:
            move = human_move(board)
            if move is None:
                print("Quitting.")
                return
        else:
            move = ai_move(board)
        game.apply_move(board, move)

    print_board(board)
    print(f"\n*** GAME OVER — {game.get_winner(board).upper()} wins by king capture! ***\n")


def auto_game():
    """Random vs random to the end — instant proof the win condition fires."""
    board = game.create_new_game()
    moves = 0
    while not game.is_game_over(board):
        legal = game.get_legal_moves(board)
        if not legal:
            print("Draw — a side ran out of legal moves.")
            return
        board.push(random.choice(legal))
        moves += 1
        if moves > 5000:
            print("Hit 5000-move safety limit with no king capture.")
            return
    print_board(board)
    print(f"Auto game ended in {moves} moves. Winner: {game.get_winner(board).upper()}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "auto":
        auto_game()
    else:
        main()