
// export interface Stock {
//   id: string;
//   symbol: string;
//   name: string;
//   price: number;
//   change: number;
//   changePercent: number;
//   volume: number;
//   marketCap: string;
//   sector: string;
//   pe: number;
// }
export interface Stock {
  id?: string;
  symbol?: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: bigint | number;
  sector?: string;
  pe?: number;
  data?: any; // Optional field for additional data
}


