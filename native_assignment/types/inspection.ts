export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Category = 'Fresh Produce' | 'Fruits' | 'Grains & Cereals' | 'Meat & Fish' | 'General Goods' | 'Dairy & Eggs';

export interface Inspection {
  id: string;
  vendorAlias: string;
  stallCode: string;
  category: Category;
  contactNumber: string;
  riskLevel: RiskLevel;
  consent: boolean;
  imageUri: string | null;
  timestamp: string;
  groupVerificationCode: string;
}