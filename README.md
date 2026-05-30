# Game of Thrones — A Hidden-Strategy Chess Application

A chess variant with a "Fog of War" twist: opponent pieces appear as anonymous shields and their identities must be deduced from how they move. The AI uses **Information Set Monte Carlo Tree Search (ISMCTS)** to play under hidden information.

**Group 12 — COSC 304 Introduction to Artificial Intelligence**
Polytechnic University of the Philippines, BSCS 3-4

- Astejada, Lydia Paula
- Bhasa, Rein Cherztin
- Gaa, Angelo Gabrielle
- Leñar, Jorelle Cybee

---

## What it does

- All back-row pieces (King, Queen, Rooks, Bishops, Knights) are randomly scrambled at game start.
- Opponent pieces appear as shields. You deduce identities by watching how they move.
- Win by **capturing** the enemy king (not checkmate).
- Three difficulty levels controlling AI thinking time: Easy (3s), Medium (10s), Hard (20s).
- Hover any non-pawn piece to see possible identities and their probabilities (on Easy/Medium).

---

## Prerequisites

Install these once on your machine:

1. **Node.js v20 or later** — https://nodejs.org (LTS download)
2. **Python 3.11 or later** — https://python.org/downloads (check "Add Python to PATH" during install)
3. **Git** — https://git-scm.com

Verify in a terminal:
node --version
python --version
git --version

---

## Setup

### 1. Clone the repository
git clone <repo-url>
cd game-of-thrones-chess

### 2. Set up the Python AI brain

From the project root:
cd ismcts-brain
python -m venv venv

Activate the virtual environment:

- **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`
- **macOS / Linux:** `source venv/bin/activate`

You should see `(venv)` at the start of your prompt. Install the Python dependencies:
pip install -r requirements.txt

### 3. Set up the React frontend

From the project root, in a separate terminal:
cd client
npm install

---

## Running the application

You need **two terminals** open at the same time.

### Terminal 1 — start the AI server
cd ismcts-brain

Activate venv (Windows):
.\venv\Scripts\Activate.ps1
Or (macOS / Linux):
source venv/bin/activate

Then:
python app.py

You should see `Running on http://127.0.0.1:5001`. Leave this running.

### Terminal 2 — start the React app
cd client
npm run dev

You should see `Local: http://localhost:5173/`. Open that URL in your browser.

---

## How to play

1. Pick a difficulty: **Easy**, **Medium**, or **Hard**.
2. Click **Start Game**.
3. You play White (visible pieces at the bottom). Click a piece to select it; legal destinations show as yellow dots.
4. Click a destination to move. The AI thinks for the chosen time then responds.
5. Win by capturing the AI's king.

### Difficulty differences

| | Fog of war | Deduction tooltips | AI thinking time |
|---|---|---|---|
| **Easy**   | Off | On  | 3s  |
| **Medium** | On  | On  | 10s |
| **Hard**   | On  | Off | 20s |

---

## Architecture

Three layers:

- **Frontend** (`client/`) — React + Vite + TailwindCSS + Zustand. Renders the board and handles user interaction.
- **AI Engine** (`ismcts-brain/`) — Python + Flask. Runs the ISMCTS algorithm to pick moves.
- **HTTP API** — Flask exposes two endpoints:
  - `POST /ai/new_game` creates a scrambled board.
  - `POST /ai/move` accepts a game state, returns the AI's chosen move + per-piece deduction probabilities.

The AI uses **Information Set Monte Carlo Tree Search**. Each iteration: (1) guesses identities for hidden opponent pieces consistent with their movement history (determinization), (2) walks a search tree by UCB, (3) simulates the rest of the game, (4) updates statistics. It then picks the move that won most often across thousands of guesses.

---

## Project structure
game-of-thrones-chess/
├── client/                      ← React frontend
│   └── src/
│       ├── components/
│       │   ├── Board/           ← Board + Square
│       │   ├── Piece/           ← Real piece + shield renderer
│       │   ├── GameInfo/        ← Sidebar
│       │   └── Modal/           ← Menu + Game Over
│       ├── store/               ← Zustand global state
│       ├── utils/               ← FEN parser + API client
│       └── App.jsx
│
├── ismcts-brain/                ← Python AI
│   ├── ismcts/
│   │   ├── node.py              ← MCTS tree node
│   │   ├── determinization.py   ← Hidden piece guessing
│   │   └── tree.py              ← ISMCTS main loop
│   ├── chess_eval/
│   │   └── evaluator.py         ← Heuristic scoring
│   ├── game.py                  ← Game logic + back-row scramble
│   ├── play.py                  ← Command-line tester
│   ├── app.py                   ← Flask HTTP API
│   └── requirements.txt
│
└── README.md

---

## Command-line testing

You can also play the AI from a terminal without the React UI:
cd ismcts-brain
(activate venv as above)
python play.py

This is the same AI without the browser or fog — useful for testing.

---

## Troubleshooting

**"python is not recognized" (Windows)** — Python wasn't added to PATH during install. Re-run the Python installer and check "Add Python to PATH" on the first screen.

**"running scripts is disabled" when activating venv (PowerShell)** — run this once and retry:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

**CORS error in the browser console** — the Flask server isn't running, or it's on a different port. Make sure Terminal 1 shows `Running on http://127.0.0.1:5001`.

**Board renders without pieces** — open browser DevTools (F12) → Console tab to see the actual error. Almost always means the API didn't return a valid FEN.

**The AI takes too long** — Hard mode allots 20 seconds per move. Check Terminal 1; the AI is probably still thinking.

---

*June 2026 — Polytechnic University of the Philippines*
