import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export class GrpcInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const data = context.switchToRpc().getData();
        const ctx = context.switchToRpc().getContext();
        const meta = ctx.getMap();

        const targetClass = context.getClass().name;
        const targetHandler = context.getHandler().name;

        const traceId = meta['trace-id'];
        const clientService = meta['client-service'];
        const clientClass = meta['client-class'];
        const clientMethod = meta['client-method'];

        const from = `${clientService}/${clientClass}/${clientMethod}`;
        const to = `${targetClass}/${targetHandler}`;

        const timestamp = new Date();
        const receivedRequestLog = {
            type: 'RECEIVED_REQUEST',
            traceId,
            from,
            to,
            data,
            timestamp,
        }

        console.log(receivedRequestLog);

        return next.handle().pipe(
            map((data) => {
                const resTimestamp = new Date();
                const resLog = {
                    type: 'RETURN_RESPONSE',
                    traceId,
                    from,
                    to,
                    data,
                    timestamp: resTimestamp,
                }

                console.log(resLog);

                return data;
            })
        )
    }
}