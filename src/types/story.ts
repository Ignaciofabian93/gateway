export type Story = {
  id: number;
  title: string;
  description: string;
  images: string[];
  sellerId: string; // Changed from userId to sellerId
};
