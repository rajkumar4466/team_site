export interface GalleryPhoto {
  url: string;           // relative path e.g. "/images/gallery/shreyas-iyer-1.jpg"
  alt: string;           // descriptive alt text for accessibility
  caption: string;       // short caption shown below photo in UI
}

export interface GalleryEntry {
  playerId: string;      // matches Player.id slug, e.g. "shreyas-iyer"
  playerName: string;    // display name, e.g. "Shreyas Iyer"
  photos: GalleryPhoto[]; // 3+ photos per player
}
