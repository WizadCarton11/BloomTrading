import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Decimal } from '@prisma/client/runtime/library';
import * as path from 'path';

const PROTO_AUTH_PATH = path.join(__dirname, '../../auth/proto/auth.proto');
const PROTO_BANK_PATH = path.join(__dirname, '../../bank-account/proto/bank.proto');


const authPackageDefinition = protoLoader.loadSync(PROTO_AUTH_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const bankPackageDefinition = protoLoader.loadSync(PROTO_BANK_PATH, {
  keepCase: true,
  longs: String, // Use String for long values
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(authPackageDefinition) as any;
const bankProto = grpc.loadPackageDefinition(bankPackageDefinition) as any;

const authClient = new authProto.auth.AuthService(
  process.env.AUTH_GRPC_URL || 'localhost:50051',
  grpc.credentials.createInsecure()
);

const bankClient = new bankProto.bank.BankService(
  process.env.BANK_GRPC_URL || 'localhost:50052',
  grpc.credentials.createInsecure()
);
// const bankClient = new authProto.bank.BankService(
//   process.env.BANK_GRPC_URL || 'localhost:50052',
//   grpc.credentials.createInsecure()
// );
// const stockClient = new authProto.stock.StockService(
//   process.env.STOCK_GRPC_URL || 'localhost:50053',
//   grpc.credentials.createInsecure()
// );


//#region Auth Service

//#region Auth Service Interfaces
interface ValidateTokenResponse {
  valid: boolean;
  user_id: string;
  email: string;
  error?: string;
  accessToken?: string;
}

interface GetUserByIdResponse {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  error?: string;
}
//#endregion

export function validateToken(token: string, refreshToken: string): Promise<ValidateTokenResponse> {
  return new Promise((resolve, reject) => {
    authClient.ValidateToken({ accessToken: token, refreshToken: refreshToken }, (error: grpc.ServiceError | null, response: ValidateTokenResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export function getUserById(userId: string): Promise<GetUserByIdResponse> {
  return new Promise((resolve, reject) => {
    authClient.GetUserById({ user_id: userId }, (error: grpc.ServiceError | null, response: GetUserByIdResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
//#endregion

//#region Bank Service Interfaces
interface LockAmountResponse {
  success: boolean;
  message?: string;
  error?: string;
}
export function lockAmount(accountId: string, amount: Decimal): Promise<LockAmountResponse> {
  return new Promise((resolve, reject) => {
    bankClient.LockAmount({ accountId, amount: amount.toString() }, (error: grpc.ServiceError | null, response: LockAmountResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
//#endregion