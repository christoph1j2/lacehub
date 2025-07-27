import { IsString, IsNotEmpty } from 'class-validator';

export class FileReportDto {
    @IsString()
    @IsNotEmpty()
    reportText: string;
}
