import { Prisma, PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import * as StockErrors from '../errors/index';
import { StocksResponseInterface } from './stocks.interface';
import { bindAllMethods } from '../utils/bind-all-methods';

const prisma = new PrismaClient();



class StockService {
    async getStocks(limit: number = 50, offset: number = 0): Promise<StocksResponseInterface> {
        // console.log(`SELECT symbol, name, description, sector, industry FROM stock_info ORDER BY symbol LIMIT ${limit} OFFSET ${offset} `)
        //   const [paginatedData, allSymbols, countResult] = await prisma.$transaction([
        //     prisma.$queryRaw`SELECT symbol, name, description, sector, industry FROM stock_info ORDER BY symbol LIMIT ${BigInt(limit)} OFFSET ${BigInt(offset)} `,
        //     prisma.$queryRaw`SELECT symbol FROM stock_info ORDER BY symbol LIMIT ${BigInt(limit)} OFFSET ${BigInt(offset)} `,
        //     prisma.$queryRaw`SELECT COUNT(*) AS total FROM stock_info`,
        //     ]);
        //     let data= { stocks: paginatedData, allStocksList: (allSymbols as Array<{symbol: string}>).map(stock => stock.symbol),
        //      totalCount: Number((countResult as any)[0]['total']) };
        const data: any = await prisma.$queryRaw`
            SELECT symbol, name, description, sector, industry, exchange, marketcapitalization,
            CAST(COUNT(*) OVER () AS INTEGER) AS total
            
            FROM stock_info
            ORDER BY symbol
            LIMIT ${BigInt(limit)} OFFSET ${BigInt(offset)};
        `;
        const uniqueSectors = new Set<string>();
        data.forEach((stock: any) => {
            if (stock.sector) {
                uniqueSectors.add(stock.sector);
            }
        });
        return {
            stocks: data.map((stock: any) => ({
                id: uuidv4(), // Generate a unique ID for each stock
                symbol: stock.symbol,
                name: stock.name,
                description: stock.description,
                sector: stock.sector,
                industry: stock.industry,
                exchange: stock.exchange,
                marketCap: stock.marketcapitalization,
            })),
            sectors: Array.from(uniqueSectors),
            allStocksList: data.map((stock: any) => stock.symbol),
            totalCount: data.length > 0 ? Number(data[0].total) : 0
        }

    }
    async getStockBySymbol(symbol: string): Promise<any> {
        const stockData: any = await prisma.$queryRaw`
        SELECT *
        FROM stock_info
        WHERE symbol = ${symbol}
        LIMIT 1;
    `;

        if (stockData.length === 0) {
            throw new StockErrors.StockNotFoundError(`Stock with symbol ${symbol} not found`);
        }

        const historicalTableName = symbol.toLowerCase();
        const historicalQuery = `SELECT * FROM "${historicalTableName}" ORDER BY index DESC`;
        const historicalData: any = await prisma.$queryRawUnsafe(historicalQuery);
        const latestDate = historicalData.length > 0 ? historicalData[0].index : null;
        const stock = stockData[0];
        
        return {
            id: uuidv4(),
            ...stock,
            historicalData: historicalData.map((data: any) => ({
                date: data.index,
                open: Number(data.open),
                high: Number(data.high),
                low: Number(data.low),
                close: Number(data.close),
                volume: Number((Number(data.volume) / 100000).toFixed(2)), // safe conversion
            })),
            latestDate: latestDate ? new Date(latestDate).toISOString() : null,

        };
    }

    async getStocksDetails(symbols: string[]): Promise<any[]> {
        if (!symbols || symbols.length === 0) {
            throw new StockErrors.InvalidSymbolsError('No symbols provided');
        }

        const stockData: any = await prisma.$queryRaw`
            SELECT *
            FROM stock_info
            WHERE symbol IN (${Prisma.join(symbols)})
        `;

        if (stockData.length === 0) {
            throw new StockErrors.StockNotFoundError(`No stocks found for the provided symbols`);
        }
// "symbol"
// "assettype"
// "name"
// "description"
// "cik"
// "exchange"
// "currency"
// "country"
// "sector"
// "industry"
// "address"
// "officialsite"
// "fiscalyearend"
// "latestquarter"
// "marketcapitalization"
// "ebitda"
// "peratio"
// "pegratio"
// "bookvalue"
// "dividendpershare"
// "dividendyield"
// "eps"
// "revenuepersharettm"
// "profitmargin"
// "operatingmarginttm"
// "returnonassetsttm"
// "returnonequityttm"
// "revenuettm"
// "grossprofitttm"
// "dilutedepsttm"
// "quarterlyearningsgrowthyoy"
// "quarterlyrevenuegrowthyoy"
// "analysttargetprice"
// "analystratingstrongbuy"
// "analystratingbuy"
// "analystratinghold"
// "analystratingsell"
// "analystratingstrongsell"
// "trailingpe"
// "forwardpe"
// "pricetosalesratiottm"
// "pricetobookratio"
// "evtorevenue"
// "evtoebitda"
// "beta"
// "52weekhigh"
// "52weeklow"
// "50daymovingaverage"
// "200daymovingaverage"
// "sharesoutstanding"
// "sharesfloat"
// "percentinsiders"
// "percentinstitutions"
// "dividenddate"
// "exdividenddate"
// "row_id"
         return stockData.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        description: stock.description,
        sector: stock.sector,
        industry: stock.industry,
        marketcapitalization: stock.marketcapitalization,
        peratio: stock.peratio,
        eps: stock.eps,
        dividendyield: stock.dividendyield,
        beta: stock.beta,
        "52weekhigh": stock['52weekhigh'],
        "52weeklow": stock['52weeklow'],
        revenuettm: stock.revenuettm,
        profitmargin: stock.profitmargin,
        operatingmarginttm: stock.operatingmarginttm,
        returnonequityttm: stock.returnonequityttm,
        quarterlyearningsgrowthyoy: stock.quarterlyearningsgrowthyoy,
        analysttargetprice: stock.analysttargetprice,
        analystratingstrongbuy: stock.analystratingstrongbuy,
        analystratingbuy: stock.analystratingbuy,
        analystratinghold: stock.analystratinghold,
        analystratingsell: stock.analystratingsell,
        analystratingstrongsell: stock.analystratingstrongsell,
        trailingpe: stock.trailingpe,
        forwardpe: stock.forwardpe,
        pricetosalesratiottm: stock.pricetosalesratiottm,
        pricetobookratio: stock.pricetobookratio,
        evtorevenue: stock.evtorevenue,
        evtoebitda: stock.evtoebitda,
        "50daymovingaverage": stock['50daymovingaverage'],
        "200daymovingaverage": stock['200daymovingaverage'],
        sharesoutstanding: stock.sharesoutstanding,
        sharesfloat: stock.sharesfloat,
        percentinsiders: stock.percentinsiders,
        percentinstitutions: stock.percentinstitutions,
        dividenddate: stock.dividenddate,
        exdividenddate: stock.exdividenddate,
        cik: stock.cik,
        currency: stock.currency,
        country: stock.country,
        address: stock.address,
        officialsite: stock.officialsite,
        fiscalyearend: stock.fiscalyearend,
        latestquarter: stock.latestquarter,
        row_id: stock.row_id,
        assettype: stock.assettype,
        ebitda: stock.ebitda,
        bookvalue: stock.bookvalue,
        revenuepersharettm: stock.revenuepersharettm,
        grossprofitttm: stock.grossprofitttm,
        dilutedepsttm: stock.dilutedepsttm,
        quarterlyrevenuegrowthyoy: stock.quarterlyrevenuegrowthyoy,
        // Add any other fields you need from stock_info
        id: uuidv4() // Generate a unique ID for each stock
    }));
    }
}

const stockServiceInstance = new StockService();

export const { getStocks,
    getStockBySymbol,
    getStocksDetails
} = bindAllMethods(stockServiceInstance);
// export const createAccount = accountServiceInstance.createAccount.bind(accountServiceInstance);
// export const getUserAccounts = accountServiceInstance.getUserAccounts.bind(accountServiceInstance);
// export const getAccountById = accountServiceInstance.getAccountById.bind(accountServiceInstance);
// export const createTransaction = accountServiceInstance.createTransaction.bind(accountServiceInstance);
// export const getAccountTransactions = accountServiceInstance.getAccountTransactions.bind(accountServiceInstance);
// export const transferFunds = accountServiceInstance.transferFunds.bind(accountServiceInstance);