// native_assignment/data/marketZones.ts
import { MarketZone } from '../types/market';

// Import your local images
const img1 = require('../images/pexels-capturavisualmoment-37304356.jpg');
const img2 = require('../images/pexels-gabii-fernandez-199438359-37116051.jpg');
const img3 = require('../images/pexels-magda-ehlers-pexels-35285844.jpg');
const img4 = require('../images/pexels-matvei-2160105320-37377280.jpg');
const img5 = require('../images/pexels-mike-468229-1192053.jpg');
const img6 = require('../images/pexels-muhamad-guruh-budi-hartono-430167744-37321079.jpg');

// 6 Fictional market zones with real local images
export const MOCK_MARKET_ZONES: MarketZone[] = [
  { id: '1', name: 'Zone A - Fresh Produce', category: 'Vegetables', status: 'Active', priority: 'High', image: img6 },
  { id: '2', name: 'Zone B - Grains & Cereals', category: 'Grains', status: 'Pending', priority: 'Medium', image: img5 },
  { id: '3', name: 'Zone C - Meat & Fish', category: 'Meat', status: 'Inspected', priority: 'Low', image: img2 },
  { id: '4', name: 'Zone D - Dairy & Eggs', category: 'Dairy', status: 'Active', priority: 'High', image: img4 },
  { id: '5', name: 'Zone E - Fruits', category: 'Fruits', status: 'Pending', priority: 'Medium', image: img1 },
  { id: '6', name: 'Zone F - General Goods', category: 'Household', status: 'In Progress', priority: 'Low', image: img3 },
];