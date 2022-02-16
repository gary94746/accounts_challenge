import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class DepositDTO {
  @ApiProperty({
    example: '4845ae79-1408-447b-acc5-36e5e36db67e',
    description: 'should be a valid uuid',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: '4845ae79-1408-447b-acc5-36e5e36db67e',
    description: 'should be a valid uuid',
  })
  @IsUUID()
  accountId: string;

  @ApiProperty({ example: 1000, minimum: 1 })
  @Min(1)
  @IsNumber()
  amount: number;
}
