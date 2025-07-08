import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

const PROTO_PATH = path.join(__dirname, '../../bank-account/proto/bank.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition) as any;

const bankClient = new authProto.bank.BankService(
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

export function validateToken(token: string, refreshToken: string): Promise<ValidateTokenResponse> {
  return new Promise((resolve, reject) => {
    bankClient.ValidateToken({ accessToken: token, refreshToken: refreshToken }, (error: grpc.ServiceError | null, response: ValidateTokenResponse) => {
      if (error) {
        console.error('Error validating token:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export function getUserById(userId: string): Promise<GetUserByIdResponse> {
  return new Promise((resolve, reject) => {
    bankClient.GetUserById({ user_id: userId }, (error: grpc.ServiceError | null, response: GetUserByIdResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

interface CreateBankAccountResponse {
  user_id: string;
  error?: string;
}

export function createBankAccount(userId: string): Promise<GetUserByIdResponse> {
  return new Promise((resolve, reject) => {
    console.log('Creating bank account for user:', userId);
    bankClient.CreateBankAccount({ user_id: userId }, (error: grpc.ServiceError | null, response: GetUserByIdResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}