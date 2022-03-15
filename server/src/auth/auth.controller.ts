import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { Logger } from '@nestjs/common';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

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
    this.logger.verbose(`${user.userName} want to delete his account`);
    return this.authService.deleteCurrentUser(user);
  }
}
