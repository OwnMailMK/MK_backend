import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @ApiProperty({
    description: 'Email of the user',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Name of the user',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Password of the user',
  })
  password: string;
}
