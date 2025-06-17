import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import * as AccountService from './services/account-service';

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

// server.addService(BankProto.bank.BankService.service, {
  
// });

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