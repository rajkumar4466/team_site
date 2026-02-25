import { galleryEntries } from "@/data/gallery";

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-kkr-purple mb-2">KKR Gallery</h1>
      <p className="text-gray-500 text-lg mb-12">Action shots from our favourite KKR moments</p>

      {galleryEntries.map((entry) => (
        <section key={entry.playerId} className="mb-12">
          <h2 className="text-2xl font-bold text-kkr-purple mb-4 border-l-4 border-kkr-gold pl-3">
            {entry.playerName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {entry.photos.map((photo) => (
              <div key={photo.url} className="bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-48 object-cover bg-kkr-purple-light"
                />
                <p className="text-sm text-gray-600 px-3 py-2">{photo.caption}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
