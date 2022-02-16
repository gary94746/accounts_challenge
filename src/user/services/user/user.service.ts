import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRegistrationDTO } from 'src/user/dto/user.dto';
import { AccountService } from '../account/account.service';

@Injectable()
export class UserService {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly _account: AccountService,
  ) {}

  async signUp(user: UserRegistrationDTO) {
    const newUser = await this._prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
      },
    });

    const debitAccount = await this._account.createAccount({
      userId: newUser.id,
      name: user.name + ' debit account',
      initialAmount: 1000,
      type: 'DEBIT',
    });

    const creditAccount = await this._account.createAccount({
      userId: newUser.id,
      name: user.name + ' credit account',
      initialAmount: 1000,
      type: 'CREDIT',
    });

    return {
      user: newUser,
      debitAccount,
      creditAccount,
    };
  }
}
