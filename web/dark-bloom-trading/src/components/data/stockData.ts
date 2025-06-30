
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  sector: string;
  pe: number;
}

export const stockData: Stock[] = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45230000,
    marketCap: "$2.8T",
    sector: "Technology",
    pe: 28.5
  },
  {
    id: "2",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 338.11,
    change: -1.89,
    changePercent: -0.56,
    volume: 28450000,
    marketCap: "$2.5T",
    sector: "Technology",
    pe: 32.1
  },
  {
    id: "3",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 127.85,
    change: 3.42,
    changePercent: 2.75,
    volume: 31200000,
    marketCap: "$1.6T",
    sector: "Technology",
    pe: 26.8
  },
  {
    id: "4",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 142.65,
    change: -0.95,
    changePercent: -0.66,
    volume: 38900000,
    marketCap: "$1.5T",
    sector: "Consumer",
    pe: 45.2
  },
  {
    id: "5",
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.73,
    change: 12.45,
    changePercent: 5.27,
    volume: 89500000,
    marketCap: "$791B",
    sector: "Consumer",
    pe: 68.4
  },
  {
    id: "6",
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 298.58,
    change: -4.32,
    changePercent: -1.43,
    volume: 22100000,
    marketCap: "$756B",
    sector: "Technology",
    pe: 22.9
  },
  {
    id: "7",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 421.13,
    change: 8.76,
    changePercent: 2.12,
    volume: 35600000,
    marketCap: "$1.0T",
    sector: "Technology",
    pe: 71.5
  },
  {
    id: "8",
    symbol: "BRK.B",
    name: "Berkshire Hathaway Inc.",
    price: 345.21,
    change: 1.89,
    changePercent: 0.55,
    volume: 3890000,
    marketCap: "$782B",
    sector: "Finance",
    pe: 8.9
  },
  {
    id: "9",
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 147.85,
    change: -0.76,
    changePercent: -0.51,
    volume: 12450000,
    marketCap: "$434B",
    sector: "Finance",
    pe: 12.3
  },
  {
    id: "10",
    symbol: "JNJ",
    name: "Johnson & Johnson",
    price: 161.42,
    change: 0.98,
    changePercent: 0.61,
    volume: 8230000,
    marketCap: "$421B",
    sector: "Healthcare",
    pe: 15.7
  },
  {
    id: "11",
    symbol: "V",
    name: "Visa Inc.",
    price: 231.67,
    change: 2.34,
    changePercent: 1.02,
    volume: 7890000,
    marketCap: "$487B",
    sector: "Finance",
    pe: 31.2
  },
  {
    id: "12",
    symbol: "PG",
    name: "Procter & Gamble Co.",
    price: 148.93,
    change: -1.12,
    changePercent: -0.75,
    volume: 6780000,
    marketCap: "$356B",
    sector: "Consumer",
    pe: 24.6
  },
  {
    id: "13",
    symbol: "UNH",
    name: "UnitedHealth Group Inc.",
    price: 526.71,
    change: 4.58,
    changePercent: 0.88,
    volume: 3450000,
    marketCap: "$497B",
    sector: "Healthcare",
    pe: 26.1
  },
  {
    id: "14",
    symbol: "HD",
    name: "Home Depot Inc.",
    price: 318.47,
    change: -2.11,
    changePercent: -0.66,
    volume: 4560000,
    marketCap: "$331B",
    sector: "Consumer",
    pe: 23.8
  },
  {
    id: "15",
    symbol: "MA",
    name: "Mastercard Inc.",
    price: 392.18,
    change: 3.67,
    changePercent: 0.94,
    volume: 3210000,
    marketCap: "$378B",
    sector: "Finance",
    pe: 33.5
  },
  {
    id: "16",
    symbol: "PFE",
    name: "Pfizer Inc.",
    price: 28.94,
    change: -0.43,
    changePercent: -1.46,
    volume: 45600000,
    marketCap: "$162B",
    sector: "Healthcare",
    pe: 9.8
  },
  {
    id: "17",
    symbol: "KO",
    name: "Coca-Cola Co.",
    price: 58.73,
    change: 0.21,
    changePercent: 0.36,
    volume: 13450000,
    marketCap: "$254B",
    sector: "Consumer",
    pe: 26.4
  },
  {
    id: "18",
    symbol: "DIS",
    name: "Walt Disney Co.",
    price: 96.42,
    change: -1.87,
    changePercent: -1.90,
    volume: 18900000,
    marketCap: "$176B",
    sector: "Consumer",
    pe: 67.2
  },
  {
    id: "19",
    symbol: "ADBE",
    name: "Adobe Inc.",
    price: 487.31,
    change: 6.89,
    changePercent: 1.43,
    volume: 2340000,
    marketCap: "$218B",
    sector: "Technology",
    pe: 41.7
  },
  {
    id: "20",
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 391.56,
    change: -3.21,
    changePercent: -0.81,
    volume: 4780000,
    marketCap: "$174B",
    sector: "Technology",
    pe: 34.9
  },
  {
    id: "21",
    symbol: "XOM",
    name: "Exxon Mobil Corp.",
    price: 104.27,
    change: 1.45,
    changePercent: 1.41,
    volume: 15600000,
    marketCap: "$437B",
    sector: "Energy",
    pe: 14.2
  },
  {
    id: "22",
    symbol: "CVX",
    name: "Chevron Corp.",
    price: 157.89,
    change: 0.87,
    changePercent: 0.55,
    volume: 8790000,
    marketCap: "$298B",
    sector: "Energy",
    pe: 15.1
  },
  {
    id: "23",
    symbol: "ABBV",
    name: "AbbVie Inc.",
    price: 147.23,
    change: -0.56,
    changePercent: -0.38,
    volume: 6890000,
    marketCap: "$260B",
    sector: "Healthcare",
    pe: 14.8
  },
  {
    id: "24",
    symbol: "CRM",
    name: "Salesforce Inc.",
    price: 218.64,
    change: 4.32,
    changePercent: 2.02,
    volume: 5670000,
    marketCap: "$214B",
    sector: "Technology",
    pe: 52.3
  },
  {
    id: "25",
    symbol: "TMO",
    name: "Thermo Fisher Scientific Inc.",
    price: 523.47,
    change: 2.18,
    changePercent: 0.42,
    volume: 1230000,
    marketCap: "$206B",
    sector: "Healthcare",
    pe: 29.6
  },
  {
    id: "26",
    symbol: "COST",
    name: "Costco Wholesale Corp.",
    price: 676.92,
    change: -1.89,
    changePercent: -0.28,
    volume: 2340000,
    marketCap: "$300B",
    sector: "Consumer",
    pe: 36.8
  },
  {
    id: "27",
    symbol: "AVGO",
    name: "Broadcom Inc.",
    price: 892.13,
    change: 12.45,
    changePercent: 1.42,
    volume: 2890000,
    marketCap: "$409B",
    sector: "Technology",
    pe: 28.9
  },
  {
    id: "28",
    symbol: "ACN",
    name: "Accenture PLC",
    price: 304.71,
    change: -2.34,
    changePercent: -0.76,
    volume: 1890000,
    marketCap: "$193B",
    sector: "Technology",
    pe: 25.4
  },
  {
    id: "29",
    symbol: "WMT",
    name: "Walmart Inc.",
    price: 162.38,
    change: 0.67,
    changePercent: 0.41,
    volume: 8760000,
    marketCap: "$527B",
    sector: "Consumer",
    pe: 27.1
  },
  {
    id: "30",
    symbol: "LIN",
    name: "Linde PLC",
    price: 397.56,
    change: 1.23,
    changePercent: 0.31,
    volume: 1560000,
    marketCap: "$201B",
    sector: "Industrial",
    pe: 33.7
  }
];
