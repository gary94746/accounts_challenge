import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Random name',
      email: 'myemail@email.com',
    },
  });

  const debitAccount = await prisma.account.create({
    data: {
      name: 'DEBIT ACCOUNT',
      type: 'DEBIT',
      userId: user.id,
    },
  });
  const creditAccount = await prisma.account.create({
    data: {
      name: 'CREDIT ACCOUNT',
      type: 'CREDIT',
      userId: user.id,
    },
  });

  await prisma.accountBalance.createMany({
    data: [
      {
        balance: 1000,
        amount: 0,
        operationType: 'PAYMENT',
        accountId: debitAccount.id,
      },
      {
        balance: 1000,
        amount: 0,
        operationType: 'PAYMENT',
        accountId: creditAccount.id,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
