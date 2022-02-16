import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { UserService } from './services/user/user.service';
import { AccountService } from './services/account/account.service';
import { AccountController } from './controllers/account/account.controller';

@Module({
  controllers: [UserController, AccountController],
  providers: [UserService, AccountService]
})
export class UserModule {}
