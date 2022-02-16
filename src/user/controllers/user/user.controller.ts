import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRegistrationDTO } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/services/user/user.service';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly _user: UserService) {}

  @ApiOperation({ summary: 'Signup' })
  @Post('signUp')
  async userRegistration(@Body() user: UserRegistrationDTO) {
    return this._user.signUp(user);
  }
}
