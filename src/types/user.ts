import { type AccountType, type ContactMethod, type SellerType } from "./enums";

export type Admin = {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Seller = {
  id: string;
  email: string;
  password: string;
  sellerType: SellerType;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;

  // Location information
  address: string;
  cityId?: number;
  countryId?: number;
  countyId?: number;
  regionId?: number;

  // Contact information
  phone: string;
  website?: string;
  preferredContactMethod: ContactMethod;

  // Social media links
  socialMediaLinks?: Record<string, string>; // {instagram: "url", facebook: "url", etc}

  // Business/Account information
  accountType: AccountType;
  points: number;
  userCategoryId?: number;
};

export type PersonProfile = {
  id: string;
  sellerId: string;
  firstName: string;
  lastName?: string;
  displayName?: string; // Custom display name
  bio?: string;
  birthday?: string;
  profileImage?: string;
  coverImage?: string;

  // Person-specific preferences
  allowExchanges: boolean;
};

export type StoreProfile = {
  id: string;
  sellerId: string;
  businessName: string;
  displayName?: string; // Custom display name
  description?: string;
  logo?: string;
  coverImage?: string;
  businessType?: string; // "retail", "manufacturer", etc.
  taxId?: string;
  businessRegistration?: string;

  // Store-specific settings
  allowExchanges: boolean; // Stores typically don't exchange
  minOrderAmount?: number; // Minimum order amount in cents
  shippingPolicy?: string;
  returnPolicy?: string;

  // Business hours
  businessHours?: Record<string, { open: string; close: string }>; // {monday: {open: "9:00", close: "17:00"}, etc}
};

export type UserCategory = {
  id: number;
  name: string;
  level: number;
  categoryDiscountAmount: number;
  pointsThreshold: number;
};

export type Session = {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  sellerId: string; // Changed from userId to sellerId
};
