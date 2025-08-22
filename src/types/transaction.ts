import { type TransactionKind, type ExchangeStatus } from "./enums";

export type Transaction = {
  id: number;
  kind: TransactionKind;
  pointsCollected: number;
  createdAt: string;
  sellerId: string; // Changed from userId to sellerId
};

export type Exchange = {
  id: number;
  transactionId: number;
  offeredProductId: number;
  requestedProductId: number;
  status: ExchangeStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
};
