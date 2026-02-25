import { seasonRecords, topPerformers } from "@/data/stats";

export default function StatsPage() {
  const runners = topPerformers.filter((p) => p.category === "runs");
  const wicketTakers = topPerformers.filter((p) => p.category === "wickets");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-kkr-purple mb-2">KKR Season Stats</h1>
      <p className="text-gray-500 text-lg mb-12">Kolkata Knight Riders in the IPL — 2008 to 2024</p>

      {/* Section 1: Season Records */}
      <h2 className="text-2xl font-bold text-kkr-purple mb-6">Season-by-Season Record</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-16">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-kkr-purple text-white text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Year</th>
              <th className="px-4 py-3 text-center">Position</th>
              <th className="px-4 py-3 text-center">Wins</th>
              <th className="px-4 py-3 text-center">Losses</th>
              <th className="px-4 py-3 text-center">NR</th>
              <th className="px-4 py-3 text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {seasonRecords.map((record, index) => (
              <tr
                key={record.year}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-bold text-kkr-purple">{record.year}</td>
                <td className="px-4 py-3 text-center text-gray-700">#{record.position}</td>
                <td className="px-4 py-3 text-center text-gray-700">{record.wins}</td>
                <td className="px-4 py-3 text-center text-gray-700">{record.losses}</td>
                <td className="px-4 py-3 text-center text-gray-700">{record.noResult}</td>
                <td className="px-4 py-3 text-center">
                  {record.title ? (
                    <span className="bg-kkr-gold text-kkr-purple-dark text-xs font-bold px-2 py-0.5 rounded-full">
                      IPL Champion
                    </span>
                  ) : (
                    <span className="text-gray-500">#{record.position}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Top Performers */}
      <h2 className="text-2xl font-bold text-kkr-purple mb-6 mt-16">All-Time Top Performers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Top Run-Scorers */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-kkr-purple mb-4">Top Run-Scorers</h3>
          <ol>
            {runners.map((player, index) => (
              <li
                key={player.name}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <span className="text-kkr-gold font-bold text-lg mr-3">{index + 1}</span>
                  <span className="font-semibold text-gray-800">{player.name}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold text-kkr-purple text-lg">{player.total}</span>
                  <span className="text-xs text-gray-400 ml-1">runs</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Card 2: Top Wicket-Takers */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-kkr-purple mb-4">Top Wicket-Takers</h3>
          <ol>
            {wicketTakers.map((player, index) => (
              <li
                key={player.name}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <span className="text-kkr-gold font-bold text-lg mr-3">{index + 1}</span>
                  <span className="font-semibold text-gray-800">{player.name}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold text-kkr-purple text-lg">{player.total}</span>
                  <span className="text-xs text-gray-400 ml-1">wkts</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
