import Link from "next/link";
import { Player } from "@/types/player";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="group block bg-white rounded-lg border-t-4 border-kkr-purple shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Player image placeholder */}
      <div className="relative bg-kkr-purple-light h-40 w-full flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-200">
        {/* Jersey number badge */}
        <span className="absolute top-2 right-2 bg-kkr-gold text-kkr-purple-dark font-bold text-xs px-2 py-1 rounded-full z-10">
          #{player.jerseyNumber}
        </span>
        {/* Player initials */}
        <span className="text-4xl font-extrabold text-white opacity-80 select-none">
          {getInitials(player.name)}
        </span>
      </div>

      {/* Player info */}
      <div className="p-4">
        <h3 className="text-kkr-purple font-bold text-lg leading-tight mb-1">
          {player.name}
        </h3>
        <p className="text-gray-500 text-sm">{player.role}</p>
        <p className="text-gray-400 text-xs mt-0.5">{player.nationality}</p>
      </div>
    </Link>
  );
}
