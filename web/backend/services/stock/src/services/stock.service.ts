import { Prisma, PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import * as StockErrors from '../errors/index';
import { StocksResponseInterface } from './stocks.interface';
import { bindAllMethods } from '../utils/bind-all-methods';
import { sendKafkaMessage } from '../utils/kafka.producer';

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

    async addToPortfolio(
        userId: string,
        transactionId: string,
        symbol: string,
        quantity: number,
        amount: number,
        averagePrice: number
    ): Promise<void> {
        if (quantity <= 0 || amount <= 0) {
            throw new Error("Quantity and amount must be positive to add to portfolio");
        }

        const existing = await prisma.portfolio.findFirst({
            where: { userId, symbol }
        });

        if (existing) {
            const newQuantity = existing.quantity + quantity;
            const newTotalValue = existing.totalValue + amount;

            await prisma.portfolio.update({
                where: { id: existing.id },
                data: {
                    quantity: newQuantity,
                    totalValue: newTotalValue,
                    averageCost: newQuantity > 0 ? newTotalValue / newQuantity : 0,
                    updatedAt: new Date(),
                    transactionId
                }
            });
        } else {
            await prisma.portfolio.create({
                data: {
                    userId,
                    symbol,
                    quantity,
                    totalValue: amount,
                    averageCost: averagePrice,
                    transactionId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        }

        await sendKafkaMessage('transactions_success', {
            event: 'transaction_completed',
            data: { transactionId, userId }
        });

        console.log(`💰 Transaction completed for user ${userId} with stock ${symbol}`);
    }

    async removeFromPortfolio(
        userId: string,
        transactionId: string,
        symbol: string,
        quantity: number,
        amount: number
    ): Promise<void> {
        if (quantity <= 0 || amount <= 0) {
            throw new Error("Quantity and amount must be positive to remove from portfolio");
        }

        const portfolioItem = await prisma.portfolio.findFirst({
            where: { userId, symbol }
        });

        if (!portfolioItem) {
            throw new StockErrors.PortfolioItemNotFoundError(`Portfolio item with symbol ${symbol} not found for user ${userId}`);
        }

        if (portfolioItem.quantity < quantity) {
            throw new StockErrors.InsufficientQuantityError(`Insufficient quantity in portfolio for symbol ${symbol}`);
        }

        const remainingQuantity = portfolioItem.quantity - quantity;

        if (remainingQuantity === 0) {
            await prisma.portfolio.delete({
                where: { id: portfolioItem.id }
            });
        } else {
            const remainingTotalValue = portfolioItem.totalValue - amount;

            await prisma.portfolio.update({
                where: { id: portfolioItem.id },
                data: {
                    quantity: remainingQuantity,
                    totalValue: remainingTotalValue,
                    averageCost: portfolioItem.averageCost, // do not change on sell
                    updatedAt: new Date(),
                    transactionId
                }
            });
        }

        await sendKafkaMessage('transactions_success', {
            event: 'transaction_completed',
            data: { transactionId, userId }
        });

        console.log(`📉 Removed ${quantity} of ${symbol} from user ${userId}'s portfolio`);
    }

    async getStockByUserIdAndSymbol(userId: string, symbol: string): Promise<any> {
        const portfolioItem = await prisma.portfolio.findFirst({
            where: {
                userId: userId,
                symbol: symbol
            }
        });

        return portfolioItem;
    }

    async getPortfolio(userId: string) {
        const portfolio = await prisma.portfolio.findMany({
            where: {
                userId: userId
            }
        });
        const listOfAllSymbols = portfolio.map(item => item.symbol);

        return {
            portfolio,
            listOfAllSymbols
        }
    }
}

const stockServiceInstance = new StockService();

export const { getStocks,
    getStockBySymbol,
    getStocksDetails,
    addToPortfolio,
    getPortfolio,
    removeFromPortfolio,
    getStockByUserIdAndSymbol
} = bindAllMethods(stockServiceInstance);
// export const createAccount = accountServiceInstance.createAccount.bind(accountServiceInstance);
// export const getUserAccounts = accountServiceInstance.getUserAccounts.bind(accountServiceInstance);
// export const getAccountById = accountServiceInstance.getAccountById.bind(accountServiceInstance);
// export const createTransaction = accountServiceInstance.createTransaction.bind(accountServiceInstance);
// export const getAccountTransactions = accountServiceInstance.getAccountTransactions.bind(accountServiceInstance);
// export const transferFunds = accountServiceInstance.transferFunds.bind(accountServiceInstance);