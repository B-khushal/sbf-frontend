import api from './api';
import { AutocompleteSuggestion, GeocodeResult } from '../types/location';

/**
 * Call the backend autocomplete proxy endpoint.
 */
export const searchAddress = async (query: string, location?: string): Promise<AutocompleteSuggestion[]> => {
  const params: { query: string; location?: string } = { query };
  if (location) {
    params.location = location;
  }
  const response = await api.get('/mappls/autocomplete', { params });
  return response.data;
};

/**
 * Call the backend place details proxy endpoint to resolve coordinates for a suggestion.
 */
export const getPlaceDetails = async (eLoc: string): Promise<{ latitude: number; longitude: number }> => {
  const response = await api.get('/mappls/place-details', { params: { eLoc } });
  return response.data;
};

/**
 * Call the backend reverse geocode proxy endpoint to get structured address elements from coords.
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodeResult> => {
  const response = await api.get('/mappls/reverse-geocode', { params: { lat, lng } });
  return response.data;
};
