export interface  SingleStockInfoResponseInterface {
  symbol: string,
  name: string,
  description: string,
  sector: string,
  industry: string,
}

export interface StocksResponseInterface {
  stocks: any,
  allStocksList: any,
  totalCount: any,
}