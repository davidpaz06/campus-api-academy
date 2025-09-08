import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AppInterceptor implements NestInterceptor {
  private readonly ALLOWED_CLIENTS = ['campus-api-gateway'];

  private readonly ALLOWED_IPS = [
    process.env.GATEWAY_IP,
    process.env.GATEWAY_HOST,
    'localhost',
    '127.0.0.1',
    '::1',
    process.env.RENDER_EXTERNAL_HOSTNAME,
    process.env.RAILWAY_STATIC_URL,
  ].filter(Boolean);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcContext = context.switchToRpc();
    const metadata = rpcContext.getContext();
    const metadataMap = metadata.getMap();

    const clientIdRaw = metadataMap['x-client-id'] || metadataMap['client-id'];
    const clientId =
      typeof clientIdRaw === 'string' ? clientIdRaw : String(clientIdRaw);

    if (clientId && !this.ALLOWED_CLIENTS.includes(clientId)) {
      console.warn(`🚫 Unauthorized client attempted access: ${clientId}`);
      throw new ForbiddenException(`Client '${clientId}' is not authorized`);
    }

    const clientIp =
      metadataMap['x-forwarded-for'] ||
      metadataMap['x-real-ip'] ||
      metadataMap['remote-addr'];

    if (process.env.NODE_ENV === 'production' && clientIp) {
      const isAllowedIp = this.ALLOWED_IPS.some(
        (allowedIp) =>
          typeof clientIp === 'string' &&
          typeof allowedIp === 'string' &&
          (clientIp.includes(allowedIp) || allowedIp.includes(clientIp)),
      );

      if (!isAllowedIp) {
        console.warn(`🚫 Unauthorized IP attempted access: ${clientIp}`);
        throw new ForbiddenException(`IP '${clientIp}' is not authorized`);
      }
    }

    const userAgent = metadataMap['user-agent'];
    if (
      userAgent &&
      !userAgent.includes('grpc') &&
      !userAgent.includes('campus')
    ) {
      console.warn(`🚫 Suspicious user-agent: ${userAgent}`);
    }

    console.log(
      `✅ Authorized request from client: ${clientId || 'unknown'}, IP: ${clientIp || 'unknown'}`,
    );
    return next.handle();
  }
}
