import { IsString } from "class-validator";

export class UpdateUserDto {
    @IsString()
    login: string;
    @IsString()
    sub?: string;
    @IsString()
    sbbAccessToken?: string;
    @IsString()
    sbbRefreshToken?: string;
    @IsString()
    scope?: string;
}
