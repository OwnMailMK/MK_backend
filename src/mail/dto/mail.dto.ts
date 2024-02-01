import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MailDto {
  @IsString()
  @ApiProperty({
    description: 'Email of the sender',
  })
  to: string;

  @IsString()
  @ApiProperty({
    description: 'Subject of the mail',
  })
  subject: string;

  @IsString()
  @ApiProperty({
    description: 'Text of the mail',
  })
  text: string;
}
