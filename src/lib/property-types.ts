export interface PropertyMedia {
  id: string;
  propertyId: string;
  url: string;
  type: string; // 'PHOTO' | 'VIDEO'
  caption: string | null;
  isCover: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Property {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  pricePerNight: number;
  taxPercent: number;
  discountPercent: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  isActive: boolean;
  amenities: string; // JSON-encoded string[]
  checkInTime: string;
  checkOutTime: string;
  createdAt: string;
  updatedAt: string;
  media: PropertyMedia[];
}

export function coverPhoto(media: PropertyMedia[]): PropertyMedia | undefined {
  return media.find((m) => m.isCover && m.type === 'PHOTO') ?? media.find((m) => m.type === 'PHOTO');
}

export function effectiveRate(price: number, discountPercent: number): number {
  return Math.round(price - (price * discountPercent) / 100);
}

export function parseAmenities(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
