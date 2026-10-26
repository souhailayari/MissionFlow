export type CompanySite = {
  id: string;
  name: string;
  address: string | null;
  latitude: string;
  longitude: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompanySitePayload = {
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
};
