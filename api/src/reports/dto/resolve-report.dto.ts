import { IsString, IsNotEmpty } from 'class-validator';

export class ResolveReportDto {
    @IsString()
    @IsNotEmpty()
    actionTaken: string;
}
