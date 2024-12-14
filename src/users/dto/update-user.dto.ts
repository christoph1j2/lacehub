import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The username of the user' })
    username: string;
    //email: string;
}
