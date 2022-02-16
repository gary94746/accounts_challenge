import { Injectable } from '@nestjs/common';
import { Account, AccountType, OperationType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { OperationDTO } from 'src/user/dto/withdraw.dto';

@Injectable()
export class AccountService {
  #CREDIT_FEE = 0.05;

  constructor(private readonly _prisma: PrismaService) {}

  async withdraw({
    userId,
    accountId,
    amount,
  }: {
    userId: string;
    accountId: string;
    amount: number;
  }) {
    const { account, currentBalance } = await this.getAccount({
      userId,
      accountId,
    });

    this.verifyBalance({
      withdraw: amount,
      balance: currentBalance.balance.toNumber(),
      accountType: account.type,
      fee: this.#CREDIT_FEE,
    });
    await this.applyFee({
      account,
      amount,
      currentBalance: currentBalance.balance.toNumber(),
      fee: this.#CREDIT_FEE,
      userId,
    });

    const debt = account.type === 'CREDIT' ? amount : 0;

    return this.doOperation({
      type: 'WITHDRAWN',
      accountId,
      amount,
      userId,
      debt,
    });
  }

  createAccount({
    userId,
    type,
    initialAmount,
    name,
  }: {
    userId: string;
    type: AccountType;
    initialAmount: number;
    name: string;
  }) {
    return this._prisma.account.create({
      data: {
        name,
        userId,
        type,
        accountBalance: {
          create: {
            amount: initialAmount,
            balance: initialAmount,
            operationType: 'PAYMENT',
          },
        },
      },
    });
  }

  async increaseSavings({
    amount,
    accountId,
    userId,
  }: {
    amount: number;
    accountId: string;
    userId: string;
  }) {
    const account = await this._prisma.account.findUnique({
      where: { id: accountId },
    });
    if (account.type !== 'DEBIT') {
      throw new Error('Only debit account can do this operation');
    }

    return this.doOperation({
      type: 'PAYMENT',
      accountId: account.id,
      userId,
      amount,
    });
  }

  async getAccount({
    userId,
    accountId,
  }: {
    userId: string;
    accountId: string;
  }) {
    const account = await this._prisma.account.findFirst({
      where: { id: accountId, userId },
      include: {
        accountBalance: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    const [currentBalance] = account?.accountBalance || [];
    if (!currentBalance) {
      throw new Error('Cannont get current balance');
    }

    return { account, currentBalance };
  }

  async payCredit(payCredit: OperationDTO) {
    const { account, currentBalance } = await this.getAccount({
      userId: payCredit.userId,
      accountId: payCredit.accountId,
    });

    if (account.type === 'DEBIT') {
      throw new Error('Only credit accounts should be paid');
    }

    if (currentBalance.debt.toNumber() === 0) {
      throw new Error('You have no debs');
    }

    if (currentBalance.debt.toNumber() !== payCredit.amount) {
      throw new Error(`You should pay the exact deb ${currentBalance.debt}`);
    }

    return this.doOperation({
      type: 'PAYMENT',
      amount: payCredit.amount,
      accountId: payCredit.accountId,
      userId: payCredit.userId,
      debt: -payCredit.amount,
    });
  }

  verifyBalance({
    withdraw,
    balance,
    accountType,
    fee,
  }: {
    withdraw: number;
    balance: number;
    accountType: AccountType;
    fee: number;
  }) {
    const isBalanceEnoughForDebit =
      withdraw <= balance && accountType === 'DEBIT';
    if (isBalanceEnoughForDebit) {
      return true;
    }

    const withdrawFee = withdraw * (1 + fee);
    const isBalanceEnoughForCredit =
      withdrawFee <= balance && accountType === 'CREDIT';
    if (isBalanceEnoughForCredit) {
      return true;
    }

    throw new Error('Your founds are not enough to apply this operation');
  }

  async doOperation({
    type,
    amount,
    accountId,
    userId,
    debt = 0,
  }: {
    type: OperationType;
    amount: number;
    accountId: string;
    userId: string;
    debt?: number;
  }) {
    const { account, currentBalance } = await this.getAccount({
      userId,
      accountId,
    });

    const ops = {
      PAYMENT: (amount: number) => currentBalance.balance.toNumber() + amount,
      WITHDRAWN: (amount: number) => currentBalance.balance.toNumber() - amount,
      FEE: (amount: number) => currentBalance.balance.toNumber() - amount,
    };

    const newDebt = currentBalance.debt.toNumber() + debt;

    return this._prisma.accountBalance.create({
      data: {
        balance: ops[type](amount),
        amount,
        operationType: type,
        accountId,
        debt: newDebt,
      },
    });
  }

  async applyFee({
    account,
    fee,
    userId,
    amount,
  }: {
    account: Account;
    currentBalance: number;
    fee: number;
    amount: number;
    userId: string;
  }) {
    if (account.type === 'DEBIT') {
      return true;
    }

    const feeAmount = amount * fee;

    await this.doOperation({
      type: 'FEE',
      accountId: account.id,
      amount: feeAmount,
      userId,
    });
  }
}
