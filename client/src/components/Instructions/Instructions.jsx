export default function Instructions() {
  return (
    <div className="flex flex-col gap-3 w-64 p-4 bg-[#1a1a1a] text-white rounded-lg border border-yellow-900">
      <h2 className="text-sm text-yellow-500 uppercase tracking-widest font-bold">How to Play</h2>
      <div className="flex flex-col gap-2 text-xs text-gray-300 leading-relaxed">
        <p><span className="text-yellow-700 font-bold">Goal —</span> Capture the enemy King.</p>
        <p><span className="text-yellow-700 font-bold">Scramble —</span> Back-row pieces are randomly placed at game start.</p>
        <p><span className="text-yellow-700 font-bold">Fog of War —</span> Opponent pieces appear as shields on Medium and Hard.</p>
        <p><span className="text-yellow-700 font-bold">Deduction —</span> Movement reveals identity: bishops slide diagonally, knights jump in L-shapes, etc.</p>
        <p><span className="text-yellow-700 font-bold">Hover —</span> Hover any piece to see its possible identities (Easy and Medium).</p>
        <p><span className="text-yellow-700 font-bold">No special moves —</span> No castling, en passant, or pawn promotion.</p>
        <p><span className="text-yellow-700 font-bold">Reveal —</span> A piece reveals itself when it captures or attacks the King.</p>
      </div>
    </div>
  )
}