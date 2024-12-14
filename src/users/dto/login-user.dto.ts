import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'The email of the user' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The password of the user' })
    password: string;
}
