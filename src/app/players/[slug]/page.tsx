import { players, getPlayerBySlug } from "@/data/players";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/CommentSection";

// Pre-renders known player slugs at build time for fast initial load
export function generateStaticParams() {
  return players.map((player) => ({ slug: player.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);
  return {
    title: player ? `${player.name} | KKR Squad` : "Player Not Found",
  };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);

  if (!player) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <a
        href="/players"
        className="inline-flex items-center gap-1 text-kkr-purple hover:text-kkr-purple-light font-medium mb-8 transition-colors"
      >
        ← Back to Squad
      </a>

      {/* Hero: two-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* LEFT — Photo area */}
        <div className="relative">
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-full aspect-square object-cover rounded-2xl bg-kkr-purple-light"
          />
          {/* Jersey number badge */}
          <div className="absolute bottom-4 right-4 bg-kkr-purple-dark text-kkr-gold font-black text-4xl px-3 py-1 rounded-lg">
            #{player.jerseyNumber}
          </div>
        </div>

        {/* RIGHT — Bio details */}
        <div className="flex flex-col gap-5">
          {/* Player name */}
          <h1 className="text-4xl font-extrabold text-kkr-purple">
            {player.name}
          </h1>

          {/* Role badge */}
          <span className="bg-kkr-purple text-kkr-gold text-sm font-semibold px-3 py-1 rounded-full inline-block w-fit">
            {player.role}
          </span>

          {/* Bio */}
          <p className="text-gray-600 text-base leading-relaxed">{player.bio}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Nationality
              </p>
              <p className="text-xl font-bold text-kkr-purple">
                {player.nationality}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Age
              </p>
              <p className="text-xl font-bold text-kkr-purple">{player.age}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Jersey Number
              </p>
              <p className="text-xl font-bold text-kkr-purple">
                #{player.jerseyNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments and sentiment — full width below the hero grid */}
      <CommentSection playerId={slug} />
    </div>
  );
}
