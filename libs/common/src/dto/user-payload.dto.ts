import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UserPayloadDto {
    @IsString()
    @IsNotEmpty()
    sub: string;
}