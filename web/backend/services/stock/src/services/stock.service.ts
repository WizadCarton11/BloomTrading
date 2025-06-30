import { PrismaClient, Account, Transaction, AccountType, TransactionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import * as AccountErrors from '../errors/index';
import { StocksResponseInterface } from './stocks.interface';
import { bindAllMethods } from '../utils/bind-all-methods';

const prisma = new PrismaClient();



class StockService {
    async getStocks(limit: number, offset: number): Promise<StocksResponseInterface> {
        console.log(`SELECT symbol, name, description, sector, industry FROM stock_info ORDER BY symbol LIMIT ${limit} OFFSET ${offset} `)
    //   const [paginatedData, allSymbols, countResult] = await prisma.$transaction([
    //     prisma.$queryRaw`SELECT symbol, name, description, sector, industry FROM stock_info ORDER BY symbol LIMIT ${BigInt(limit)} OFFSET ${BigInt(offset)} `,
    //     prisma.$queryRaw`SELECT symbol FROM stock_info ORDER BY symbol LIMIT ${BigInt(limit)} OFFSET ${BigInt(offset)} `,
    //     prisma.$queryRaw`SELECT COUNT(*) AS total FROM stock_info`,
    //     ]);
    //     let data= { stocks: paginatedData, allStocksList: (allSymbols as Array<{symbol: string}>).map(stock => stock.symbol),
    //      totalCount: Number((countResult as any)[0]['total']) };
        const data : any= await prisma.$queryRaw`
            SELECT symbol, name, description, sector, industry,
            CAST(COUNT(*) OVER () AS INTEGER) AS total
            FROM stock_info
            ORDER BY symbol
            LIMIT ${BigInt(limit)} OFFSET ${BigInt(offset)};
        `;

        return {
            stocks: data.map((stock: any) => ({
                symbol: stock.symbol,
                name: stock.name,
                description: stock.description,
                sector: stock.sector,
                industry: stock.industry
            })),
            allStocksList: data.map((stock: any) => stock.symbol),
            totalCount: data.length > 0 ? data[0].total : 0
        }

    }
  
}

const stockServiceInstance = new StockService();

export const { getStocks } =  bindAllMethods(stockServiceInstance);
// export const createAccount = accountServiceInstance.createAccount.bind(accountServiceInstance);
// export const getUserAccounts = accountServiceInstance.getUserAccounts.bind(accountServiceInstance);
// export const getAccountById = accountServiceInstance.getAccountById.bind(accountServiceInstance);
// export const createTransaction = accountServiceInstance.createTransaction.bind(accountServiceInstance);
// export const getAccountTransactions = accountServiceInstance.getAccountTransactions.bind(accountServiceInstance);
// export const transferFunds = accountServiceInstance.transferFunds.bind(accountServiceInstance);