import { Body, Controller, Post } from '@nestjs/common';
import { ApiOAuth2, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepositDTO } from 'src/user/dto/deposit.dto';
import { OperationDTO } from 'src/user/dto/withdraw.dto';
import { AccountService } from 'src/user/services/account/account.service';

@Controller('account')
@ApiTags('Account')
export class AccountController {
  constructor(private readonly _account: AccountService) {}

  @ApiOperation({ summary: 'Increase savings' })
  @Post('deposit')
  deposit(@Body() deposit: DepositDTO) {
    return this._account.increaseSavings({
      amount: deposit.amount,
      accountId: deposit.accountId,
      userId: deposit.userId,
    });
  }

  @ApiOperation({ summary: 'Withdraw' })
  @Post('withdraw')
  withdraw(@Body() withdraw: OperationDTO) {
    return this._account.withdraw({
      accountId: withdraw.accountId,
      amount: withdraw.amount,
      userId: withdraw.userId,
    });
  }

  @ApiOperation({ summary: 'Pay credit account' })
  @Post('payAccount')
  payCredit(@Body() creditPayment: OperationDTO) {
    return this._account.payCredit(creditPayment);
  }
}
