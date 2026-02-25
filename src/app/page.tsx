import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-kkr-purple text-white py-24 px-4 text-center relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-kkr-purple via-kkr-purple to-kkr-purple-dark opacity-90" />

        <div className="relative max-w-4xl mx-auto">
          <p className="text-kkr-gold text-sm font-semibold uppercase tracking-widest mb-4">
            Kolkata Knight Riders
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            The Heart of{' '}
            <span className="text-kkr-gold">Kolkata</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Explore the full KKR squad, relive iconic seasons, and discover the
            stories behind the purple and gold.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/players"
              className="bg-kkr-gold text-kkr-purple-dark font-bold px-8 py-3 rounded-lg text-sm uppercase tracking-wide hover:brightness-110 transition-all"
            >
              Meet the Squad
            </Link>
            <Link
              href="/stats"
              className="border-2 border-kkr-gold text-kkr-gold font-bold px-8 py-3 rounded-lg text-sm uppercase tracking-wide hover:bg-kkr-gold hover:text-kkr-purple-dark transition-all"
            >
              Season Stats
            </Link>
          </div>
        </div>
      </section>

      {/* Section cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-kkr-purple text-center mb-10">
          Explore KKR
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              href: '/players',
              title: 'Squad',
              desc: 'Profiles, bios, and jersey numbers for every KKR player.',
              icon: 'Squad',
            },
            {
              href: '/stats',
              title: 'Stats',
              desc: 'Season-by-season records and all-time KKR top performers.',
              icon: 'Stats',
            },
            {
              href: '/gallery',
              title: 'Gallery',
              desc: 'Action shots and memorable moments from the pitch.',
              icon: 'Gallery',
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group block bg-white border border-gray-200 rounded-xl p-6 hover:border-kkr-gold hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3 text-kkr-purple font-bold">{card.icon}</div>
              <h3 className="text-lg font-bold text-kkr-purple group-hover:text-kkr-purple-light mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
