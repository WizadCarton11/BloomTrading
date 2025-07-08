import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import * as AccountService from './services/account-service';
import { Decimal } from '@prisma/client/runtime/library';

//#region interfaces
interface LockFundRequest extends grpc.ServerUnaryCall<{ accountId: string; amount: Decimal; }, any> {
  request: { accountId: string; amount: Decimal; };
}

interface LockFundResponse extends grpc.sendUnaryData<any> {
  success: boolean;
  message: string;
  data?: any;
}
interface CreateBankAccountRequest extends grpc.ServerUnaryCall<{ user_id: string; }, any> {
  request: { user_id: string; };
}
interface CreateBankAccountResponse {
  user_id: string;
  error?: string;
  account_id: string; // Optional field for account ID
}
//#endregion
const PROTO_PATH = path.join(__dirname, '../proto/bank.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const BankProto = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server();

server.addService(BankProto.bank.BankService.service, {
    LockFund : async (call: LockFundRequest, callback: grpc.sendUnaryData<any>) => {
      try {
        const { accountId, amount } = call.request;
        const result = await AccountService.lockAmount(accountId, amount);
        callback(null, { success: true, message: 'Funds locked successfully' });
      } catch (error: any) {
        console.error('Error in LockFund:', error);
        callback(null, {
          valid: false,
          user_id: '',
          email: '',
          error: error.message || 'An error occurred while locking funds',
        });
      }
    },


  CreateBankAccount: async (call: CreateBankAccountRequest, callback: grpc.sendUnaryData<CreateBankAccountResponse>) => {
    try {
      const { user_id } = call.request;
      console.log('Creating bank account for user:', user_id);
      const result = await AccountService.createAccount({ userId:user_id, accountType: 'savings', currency: 'USD' });
      console.log('Bank account created:', result);
      callback(null, { user_id: result.id, account_id: result.accountNumber });
    } catch (error: any) {
      console.error('Error in CreateBankAccount:', error);
      callback(null, {
        user_id: '',
        error: error.message || 'An error occurred while creating bank account',
        account_id: ''
      });
    
  }
}
});

export function start(): void {
  const port = process.env.GRPC_PORT || 50052;
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error: Error | null, port: number) => {
      if (error) {
        console.error('Failed to bind gRPC server:', error);
        return;
      }
      console.log(`Bank gRPC server running on port ${port}`);
    }
  );
}