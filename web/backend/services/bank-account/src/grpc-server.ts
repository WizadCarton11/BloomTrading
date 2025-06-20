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