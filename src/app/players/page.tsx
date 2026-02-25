import { players } from "@/data/players";
import { PlayerCard } from "@/components/PlayerCard";

export default function PlayersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-kkr-purple mb-2">
          KKR Squad 2025
        </h1>
        <p className="text-gray-500 text-lg">IPL 2025 Season</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
