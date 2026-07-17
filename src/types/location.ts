export interface MapplsLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  houseNo?: string;
  apartment?: string;
  floor?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  deliveryInstructions?: string;
  recipientName?: string;
  phone?: string;
}

export interface AutocompleteSuggestion {
  placeName: string;
  placeAddress: string;
  eLoc: string;
}

export interface GeocodeResult {
  formattedAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark: string;
  houseNo: string;
  apartment: string;
  street: string;
}
