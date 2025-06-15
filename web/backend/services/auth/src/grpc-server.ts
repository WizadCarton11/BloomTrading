import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import * as authService from './services/auth-service';

const PROTO_PATH = path.join(__dirname, '../proto/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server();

interface ValidateTokenCall extends grpc.ServerUnaryCall<any, any> {
  request: {
    accessToken: string;
    refreshToken: string;
  };
}

interface GetUserByIdCall extends grpc.ServerUnaryCall<any, any> {
  request: {
    user_id: string;
  };
}

server.addService(authProto.auth.AuthService.service, {
  ValidateToken: async (call: ValidateTokenCall, callback: grpc.sendUnaryData<any>) => {
    try {
      const { accessToken, refreshToken } = call.request;
      const result = await authService.validateToken(accessToken, refreshToken);
      callback(null, result);
    } catch (error: any) {
      callback(null, {
        valid: false,
        user_id: '',
        email: '',
        error: error.message
      });
    }
  },

  GetUserById: async (call: GetUserByIdCall, callback: grpc.sendUnaryData<any>) => {
    try {
      const { user_id } = call.request;
      const user = await authService.getUserById(user_id);
      callback(null, {
        user_id: user.id,
        email: user.email,
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        is_active: user.isActive,
        error: ''
      });
    } catch (error: any) {
      callback(null, {
        user_id: '',
        email: '',
        first_name: '',
        last_name: '',
        is_active: false,
        error: error.message
      });
    }
  }
});

export function start(): void {
  const port = process.env.GRPC_PORT || 50051;
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error: Error | null, port: number) => {
      if (error) {
        console.error('Failed to bind gRPC server:', error);
        return;
      }
      console.log(`Auth gRPC server running on port ${port}`);
    }
  );
}