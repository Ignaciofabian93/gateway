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
