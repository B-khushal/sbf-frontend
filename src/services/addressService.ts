import api from './api';
import {
  clearAuthCache,
  getUserProfile,
  updateUserProfile,
  type SavedAddress,
} from './authService';

export type AddressType = 'home' | 'work' | 'other';

export interface AddressInput {
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  houseNo: string;
  apartment?: string;
  street: string;
  address?: string;
  landmark: string;
  floor?: string;
  city: string;
  state: string;
  pincode: string;
  zipCode?: string;
  country?: string;
  type: AddressType;
  deliveryOption?: 'self' | 'gift';
  deliveryInstructions?: string;
  notes?: string;
  isDefault?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string;
  receiverFirstName?: string;
  receiverLastName?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  receiverApartment?: string;
  receiverCity?: string;
  receiverState?: string;
  receiverZipCode?: string;
}

export interface AddressesResponse {
  success: boolean;
  addresses: SavedAddress[];
  defaultAddress?: SavedAddress | null;
  address?: SavedAddress;
  message?: string;
}

export const normalizeIndianMobile = (raw: string): string => {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

export const isValidIndianMobile = (raw: string): boolean => {
  const digits = normalizeIndianMobile(raw);
  return /^[6-9]\d{9}$/.test(digits);
};

export const formatAddressSingleLine = (addr: Partial<SavedAddress>): string => {
  const parts = [
    addr.houseNo,
    addr.apartment,
    addr.street || addr.address || addr.formattedAddress,
    addr.landmark ? `Near ${addr.landmark}` : '',
    addr.city,
    addr.state ? `${addr.state}${addr.pincode || addr.zipCode ? ` – ${addr.pincode || addr.zipCode}` : ''}` : addr.pincode || addr.zipCode,
  ].filter((p) => p && String(p).trim().length > 0);
  return parts.join(', ');
};

export const getAddressDisplayName = (addr: Partial<SavedAddress>): string => {
  const explicit = (addr.fullName || '').trim();
  if (explicit) return explicit;
  return `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || 'Customer';
};

const getHttpStatus = (err: unknown): number | undefined =>
  (err as { response?: { status?: number } })?.response?.status;

export const getAddresses = async (): Promise<SavedAddress[]> => {
  try {
    const response = await api.get<AddressesResponse>('/users/addresses');
    if (Array.isArray(response.data?.addresses)) {
      return response.data.addresses;
    }
  } catch (err: unknown) {
    if (getHttpStatus(err) !== 404) {
      // Fallback to profile if endpoint unavailable or network blip
      try {
        const profile = await getUserProfile({ force: true });
        return Array.isArray(profile?.addresses) ? profile.addresses : [];
      } catch {
        throw err;
      }
    }
  }

  const profile = await getUserProfile({ force: true });
  return Array.isArray(profile?.addresses) ? profile.addresses : [];
};

export const createAddress = async (payload: AddressInput): Promise<{ address: SavedAddress; addresses: SavedAddress[] }> => {
  const nameParts = payload.fullName.trim().split(/\s+/).filter(Boolean);
  const prepared: AddressInput = {
    ...payload,
    fullName: payload.fullName.trim(),
    firstName: payload.firstName || nameParts[0] || '',
    lastName: payload.lastName || nameParts.slice(1).join(' ') || '',
    phone: normalizeIndianMobile(payload.phone),
    alternatePhone: payload.alternatePhone ? normalizeIndianMobile(payload.alternatePhone) : '',
    address: payload.street || payload.address || '',
    street: payload.street || payload.address || '',
    pincode: String(payload.pincode || payload.zipCode || '').replace(/\D/g, '').slice(0, 6),
    zipCode: String(payload.pincode || payload.zipCode || '').replace(/\D/g, '').slice(0, 6),
    type: payload.type || 'home',
  };

  try {
    const response = await api.post<AddressesResponse>('/users/addresses', prepared);
    clearAuthCache();
    const addresses = response.data.addresses || [];
    const created = response.data.address || addresses[0];
    return { address: created, addresses };
  } catch (err: unknown) {
    if (getHttpStatus(err) === 404) {
      const existing = await getAddresses();
      const newAddr: SavedAddress = {
        id: `addr_${Date.now()}`,
        ...prepared,
        firstName: prepared.firstName || '',
        lastName: prepared.lastName || '',
        address: prepared.street,
        zipCode: prepared.pincode,
        deliveryOption: prepared.deliveryOption || 'self',
        isDefault: existing.length === 0 || Boolean(prepared.isDefault),
      };
      const updatedList = newAddr.isDefault
        ? [newAddr, ...existing.map((a) => ({ ...a, isDefault: false }))]
        : [...existing, newAddr];
      const updated = await updateUserProfile({ addresses: updatedList });
      return { address: newAddr, addresses: updated.addresses || updatedList };
    }
    throw err;
  }
};

export const updateAddress = async (
  id: string,
  payload: AddressInput
): Promise<{ address: SavedAddress; addresses: SavedAddress[] }> => {
  const nameParts = payload.fullName.trim().split(/\s+/).filter(Boolean);
  const prepared: AddressInput = {
    ...payload,
    fullName: payload.fullName.trim(),
    firstName: payload.firstName || nameParts[0] || '',
    lastName: payload.lastName || nameParts.slice(1).join(' ') || '',
    phone: normalizeIndianMobile(payload.phone),
    alternatePhone: payload.alternatePhone ? normalizeIndianMobile(payload.alternatePhone) : '',
    address: payload.street || payload.address || '',
    street: payload.street || payload.address || '',
    pincode: String(payload.pincode || payload.zipCode || '').replace(/\D/g, '').slice(0, 6),
    zipCode: String(payload.pincode || payload.zipCode || '').replace(/\D/g, '').slice(0, 6),
    type: payload.type || 'home',
  };

  try {
    const response = await api.put<AddressesResponse>(`/users/addresses/${id}`, prepared);
    clearAuthCache();
    const addresses = response.data.addresses || [];
    const updated = response.data.address || addresses.find((a) => a.id === id) || addresses[0];
    return { address: updated, addresses };
  } catch (err: unknown) {
    if (getHttpStatus(err) === 404) {
      const existing = await getAddresses();
      const updatedList = existing.map((a) =>
        a.id === id
          ? {
              ...a,
              ...prepared,
              address: prepared.street,
              zipCode: prepared.pincode,
              isDefault: prepared.isDefault ? true : a.isDefault,
            }
          : prepared.isDefault
          ? { ...a, isDefault: false }
          : a
      );
      const updatedProfile = await updateUserProfile({ addresses: updatedList });
      const list = updatedProfile.addresses || updatedList;
      return { address: list.find((a: SavedAddress) => a.id === id) || list[0], addresses: list };
    }
    throw err;
  }
};

export const deleteAddress = async (id: string): Promise<SavedAddress[]> => {
  try {
    const response = await api.delete<AddressesResponse>(`/users/addresses/${id}`);
    clearAuthCache();
    return response.data.addresses || [];
  } catch (err: unknown) {
    if (getHttpStatus(err) === 404) {
      const existing = await getAddresses();
      const remaining = existing.filter((a) => a.id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      const updatedProfile = await updateUserProfile({ addresses: remaining });
      return updatedProfile.addresses || remaining;
    }
    throw err;
  }
};

export const setDefaultAddress = async (id: string): Promise<SavedAddress[]> => {
  try {
    const response = await api.patch<AddressesResponse>(`/users/addresses/${id}/default`);
    clearAuthCache();
    return response.data.addresses || [];
  } catch (err: unknown) {
    if (getHttpStatus(err) === 404) {
      const existing = await getAddresses();
      const updatedList = existing.map((a) => ({ ...a, isDefault: a.id === id }));
      const updatedProfile = await updateUserProfile({ addresses: updatedList });
      return updatedProfile.addresses || updatedList;
    }
    throw err;
  }
};
