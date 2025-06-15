import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

const PROTO_PATH = path.join(__dirname, '../../auth/proto/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new authProto.auth.AuthService(
  process.env.AUTH_GRPC_URL || 'localhost:50051',
  grpc.credentials.createInsecure()
);

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
    client.ValidateToken({ accessToken: token, refreshToken: refreshToken }, (error: grpc.ServiceError | null, response: ValidateTokenResponse) => {
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
    client.GetUserById({ user_id: userId }, (error: grpc.ServiceError | null, response: GetUserByIdResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}