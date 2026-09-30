// native_assignment/types/market.ts
export type MarketStatus = 'Active' | 'Pending' | 'Inspected' | 'In Progress';
export type MarketPriority = 'High' | 'Medium' | 'Low';

export interface MarketZone {
  id: string;
  name: string;
  category: string;
  status: MarketStatus;
  priority: MarketPriority;
  image?: any; // Accepts require() output (number) or remote URI (string)
}