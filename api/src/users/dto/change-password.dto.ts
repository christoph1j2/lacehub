import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Old password' })
    oldPassword: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Password' })
    password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Confirm password' })
    confirmPassword: string;
}
