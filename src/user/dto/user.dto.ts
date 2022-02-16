import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class UserRegistrationDTO {
  @ApiProperty({ example: 'Customer lastname', minLength: 5, maxLength: 100 })
  @IsString()
  @Length(5, 100)
  name: string;

  @ApiProperty({ example: 'email@email.com', minLength: 5, maxLength: 100 })
  @IsEmail()
  @Length(5, 100)
  email: string;

  @ApiProperty({ example: 1000, minimum: 1000 })
  @Min(1000)
  @IsNumber()
  initialAmount: number;
}
