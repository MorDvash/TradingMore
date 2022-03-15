import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { Logger } from '@nestjs/common';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}
  @Post('/signup')
  signUp(@Body() AuthCredentialsDto: AuthCredentialsDto): Promise<void> {
    this.logger.verbose(`${AuthCredentialsDto.userName} trying to singUp`);
    return this.authService.signUp(AuthCredentialsDto);
  }

  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    this.logger.verbose(`${authCredentialsDto.userName} trying to singIp`);
    return this.authService.signIn(authCredentialsDto);
  }

  @Delete('/deleteCurrentUser')
  @UseGuards(AuthGuard())
  async deleteCurrentUser(@GetUser() user: User): Promise<string> {
    this.logger.verbose(`${user.userName} want to delete his Account`);
    return this.authService.deleteCurrentUser(user);
  }

  @Patch('/updateUserPassword')
  @UseGuards(AuthGuard())
  async updateUserPassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @GetUser() user: User,
  ) {
    this.logger.verbose(`${user.userName} trying to update his Password`);
    return this.authService.updateUserPassword(
      user,
      updatePasswordDto.newPassword,
    );
  }
}
