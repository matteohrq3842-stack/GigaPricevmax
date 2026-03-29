export function extractBrandFromTitle(title: string): string {
  if (!title) return '';
  
  const commonBrands = [
    'Corsair', 'Logitech', 'Asus', 'MSI', 'Samsung', 'LG', 'Sony', 
    'Microsoft', 'Nintendo', 'AMD', 'Intel', 'Nvidia', 'Razer', 
    'SteelSeries', 'HyperX', 'AOC', 'Gigabyte', 'EVGA', 'Zotac', 
    'Sapphire', 'XFX', 'Crucial', 'Kingston', 'Western Digital', 
    'Seagate', 'SanDisk', 'Lexar', 'PNY', 'Be Quiet', 'Noctua', 
    'Cooler Master', 'NZXT', 'Lian Li', 'Fractal Design', 'Phanteks', 
    'Thermaltake', 'Seasonic', 'FSP', 'Dell', 'HP', 'Lenovo', 'Acer',
    'BenQ', 'Philips', 'ViewSonic', 'Elgato', 'Glorious', 'Roccat',
    'Turtle Beach', 'JBL', 'Bose', 'Sennheiser', 'Audio-Technica',
    'Blue', 'Shure', 'HyperX', 'Trust', 'Spirit of Gamer', 'Empire Gaming',
    'PlayStation', 'Xbox'
  ];

  const lowerTitle = title.toLowerCase();
  
  for (const brand of commonBrands) {
    // Check for exact word match or start of string to avoid false positives (e.g. "and" in "Sandisk" if not careful, though logic here is simple includes)
    // Simple includes is usually fine for brand names as they are distinct enough.
    if (lowerTitle.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return 'Autre';
}
