import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The username of the user' })
    readonly username: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'The email of the user' })
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @ApiProperty({ description: 'The password of the user' })
    readonly password: string;
}
