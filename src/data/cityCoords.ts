import type { CityKey } from '@/types/worldView'

/**
 * Geographic coordinates for all physical cities in conferences.json.
 * Key format: "City, Country" — must match buildCityIndex output exactly.
 * Virtual/Online cities are excluded.
 */
const cityCoords = new Map<CityKey, { lat: number; lng: number }>([
  // North America — Canada
  ['Montreal, Canada', { lat: 45.5017, lng: -73.5673 }],
  ['Vancouver, Canada', { lat: 49.2827, lng: -123.1207 }],
  ['Toronto, Canada', { lat: 43.6532, lng: -79.3832 }],
  ['Ottawa, Canada', { lat: 45.4215, lng: -75.6972 }],
  ['Halifax, Canada', { lat: 44.6488, lng: -63.5752 }],

  // North America — United States
  ['Long Beach, United States', { lat: 33.7701, lng: -118.1937 }],
  ['New Orleans, United States', { lat: 29.9511, lng: -90.0715 }],
  ['San Diego, United States', { lat: 32.7157, lng: -117.1611 }],
  ['Boston, United States', { lat: 42.3601, lng: -71.0589 }],
  ['Las Vegas, United States', { lat: 36.1699, lng: -115.1398 }],
  ['Honolulu, United States', { lat: 21.3069, lng: -157.8583 }],
  ['Salt Lake City, United States', { lat: 40.7608, lng: -111.891 }],
  ['Seattle, United States', { lat: 47.6062, lng: -122.3321 }],
  ['Nashville, United States', { lat: 36.1627, lng: -86.7816 }],
  ['Denver, United States', { lat: 39.7392, lng: -104.9903 }],
  ['Austin, United States', { lat: 30.2672, lng: -97.7431 }],
  ['Miami, United States', { lat: 25.7617, lng: -80.1918 }],
  ['Minneapolis, United States', { lat: 44.9778, lng: -93.265 }],
  ['Albuquerque, United States', { lat: 35.0853, lng: -106.6056 }],
  ['New York, United States', { lat: 40.7128, lng: -74.006 }],
  ['Baltimore, United States', { lat: 39.2904, lng: -76.6122 }],
  ['Phoenix, United States', { lat: 33.4484, lng: -112.074 }],
  ['San Francisco, United States', { lat: 37.7749, lng: -122.4194 }],
  ['Washington, United States', { lat: 38.9072, lng: -77.0369 }],
  ['Philadelphia, United States', { lat: 39.9526, lng: -75.1652 }],
  ['Mountain View, United States', { lat: 37.3861, lng: -122.0839 }],
  ['Anchorage, United States', { lat: 61.2181, lng: -149.9003 }],

  // North America — Other
  ['Mexico City, Mexico', { lat: 19.4326, lng: -99.1332 }],
  ['Punta Cana, Dominican Republic', { lat: 18.5601, lng: -68.3725 }],
  ['San Juan, Puerto Rico', { lat: 18.4655, lng: -66.1057 }],

  // South America
  ['Santiago, Chile', { lat: -33.4489, lng: -70.6693 }],
  ['Rio de Janeiro, Brazil', { lat: -22.9068, lng: -43.1729 }],
  ['Buenos Aires, Argentina', { lat: -34.6037, lng: -58.3816 }],

  // Europe
  ['Barcelona, Spain', { lat: 41.3874, lng: 2.1686 }],
  ['Berlin, Germany', { lat: 52.52, lng: 13.405 }],
  ['Florence, Italy', { lat: 43.7696, lng: 11.2558 }],
  ['Venice, Italy', { lat: 45.4408, lng: 12.3155 }],
  ['Milan, Italy', { lat: 45.4642, lng: 9.19 }],
  ['Paris, France', { lat: 48.8566, lng: 2.3522 }],
  ['Lille, France', { lat: 50.6292, lng: 3.0573 }],
  ['Toulon, France', { lat: 43.1242, lng: 5.928 }],
  ['Nice, France', { lat: 43.7102, lng: 7.262 }],
  ['Amsterdam, Netherlands', { lat: 52.3676, lng: 4.9041 }],
  ['Munich, Germany', { lat: 48.1351, lng: 11.582 }],
  ['Bremen, Germany', { lat: 53.0793, lng: 8.8017 }],
  ['Glasgow, United Kingdom', { lat: 55.8642, lng: -4.2518 }],
  ['London, United Kingdom', { lat: 51.5074, lng: -0.1278 }],
  ['Lisbon, Portugal', { lat: 38.7223, lng: -9.1393 }],
  ['Copenhagen, Denmark', { lat: 55.6761, lng: 12.5683 }],
  ['Brussels, Belgium', { lat: 50.8503, lng: 4.3517 }],
  ['Stockholm, Sweden', { lat: 59.3293, lng: 18.0686 }],
  ['Malmo, Sweden', { lat: 55.605, lng: 13.0038 }],
  ['Budapest, Hungary', { lat: 47.4979, lng: 19.0402 }],
  ['Vienna, Austria', { lat: 48.2082, lng: 16.3738 }],
  ['Dublin, Ireland', { lat: 53.3498, lng: -6.2603 }],

  // Asia
  ['Beijing, China', { lat: 39.9042, lng: 116.4074 }],
  ['Hong Kong, China', { lat: 22.3193, lng: 114.1694 }],
  ['Macao, China', { lat: 22.1987, lng: 113.5439 }],
  ['Suzhou, China', { lat: 31.299, lng: 120.5853 }],
  ['Chengdu, China', { lat: 30.5728, lng: 104.0668 }],
  ['Shenzhen, China', { lat: 22.5431, lng: 114.0579 }],
  ['Seoul, South Korea', { lat: 37.5665, lng: 126.978 }],
  ['Jeju, South Korea', { lat: 33.4996, lng: 126.5312 }],
  ['Bangkok, Thailand', { lat: 13.7563, lng: 100.5018 }],
  ['Singapore, Singapore', { lat: 1.3521, lng: 103.8198 }],
  ['Yokohama, Japan', { lat: 35.4437, lng: 139.638 }],
  ['Tel Aviv, Israel', { lat: 32.0853, lng: 34.7818 }],
  ['Abu Dhabi, United Arab Emirates', { lat: 24.4539, lng: 54.3773 }],

  // Oceania
  ['Sydney, Australia', { lat: -33.8688, lng: 151.2093 }],
  ['Melbourne, Australia', { lat: -37.8136, lng: 144.9631 }],
  ['Brisbane, Australia', { lat: -27.4698, lng: 153.0251 }],

  // Africa
  ['Kigali, Rwanda', { lat: -1.9441, lng: 30.0619 }],
])

export default cityCoords
