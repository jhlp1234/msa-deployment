import { constructMetadata, USER_SERVICE, UserMicroservice } from "@app/common";
import { Inject, Injectable, NestMiddleware, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { ClientGrpc, ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware, OnModuleInit {
    userService: UserMicroservice.AuthServiceClient;

    constructor(
        @Inject(USER_SERVICE)
        private readonly userMicroservice: ClientGrpc,
    ){}

    onModuleInit() {
        this.userService = this.userMicroservice.getService<UserMicroservice.AuthServiceClient>('AuthService');
    }

    async use(req: any, res: any, next: (error?: any) => void) {
        const token = this.getRawToken(req);
        if(!token){
            next();
            return;
        }

        const payload = await this.verifyToken(token);

        req.user = payload;

        next();
    }

    getRawToken(req: any): string | null{
        const authHeader = req.headers['authorization'];

        return authHeader;
    }

    async verifyToken(token: string){
        const result = await lastValueFrom(this.userService.parseBearerToken({token}, constructMetadata(BearerTokenMiddleware.name, 'verifyToken')));

        return result;
    }
}