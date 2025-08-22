import { type Badge, type ProductSize, type WeightUnit, type ProductCondition } from "./enums";

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number; // Price in cents
  hasOffer: boolean;
  offerPrice: number;
  stock: number;
  sellerId: string; // Changed from userId to sellerId
  badges: Badge[];
  barcode?: string;
  brand: string;
  color?: string;
  createdAt: string;
  images: string[];
  interests: string[];
  isActive: boolean;
  isExchangeable: boolean;
  productCategoryId: number;
  ratingCount: number;
  ratings: number;
  reviewsNumber: number;
  sku?: string;
  updatedAt: string;

  // Product condition for recycled items
  condition: ProductCondition;
  conditionDescription?: string; // Detailed condition description

  // Sustainability info
  sustainabilityScore?: number; // 1-100 score
  materialComposition?: string; // e.g., "80% cotton, 20% polyester"
  recycledContent?: number; // Percentage of recycled materials
};

export type ProductLike = {
  id: number;
  productId: number;
  sellerId: string; // Changed from userId to sellerId
};

export type ProductComment = {
  id: number;
  comment: string;
  productId: number;
  sellerId: string; // Changed from userId to sellerId
};

export type MaterialImpactEstimate = {
  id: number;
  materialType: string;
  estimatedCo2SavingsKG: number;
  estimatedWaterSavingsLT: number;
};

export type ProductCategory = {
  id: number;
  departmentCategoryId: number;
  averageWeight?: number;
  fifthMaterialTypeId?: number;
  fifthMaterialTypeQuantity?: number;
  firstMaterialTypeId?: number;
  firstMaterialTypeQuantity?: number;
  fourthMaterialTypeId?: number;
  fourthMaterialTypeQuantity?: number;
  keywords: string[];
  productCategoryName: string;
  secondMaterialTypeId?: number;
  secondMaterialTypeQuantity?: number;
  size?: ProductSize;
  thirdMaterialTypeId?: number;
  thirdMaterialTypeQuantity?: number;
  weightUnit?: WeightUnit;
};

export type DepartmentCategory = {
  id: number;
  departmentCategoryName: string;
  departmentId: number;
};

export type Department = {
  id: number;
  departmentName: string;
};
