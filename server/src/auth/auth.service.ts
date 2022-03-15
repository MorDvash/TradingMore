import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService', { timestamp: true });
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredential: AuthCredentialsDto): Promise<void> {
    const salt = await bcrypt.genSalt();
    authCredential.password = await bcrypt.hash(authCredential.password, salt);
    return this.userRepository.createUser(authCredential);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { userName, password } = authCredentialsDto;
    const user = await this.userRepository.findOne({ userName });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { userName };
      const accessToken: string = this.jwtService.sign(payload);
      this.logger.verbose(`${userName} signIn`);
      return { accessToken };
    } else {
      this.logger.error(`login credentials was wrong for ${userName}`);
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async deleteCurrentUser(user: User): Promise<string> {
    return await this.userRepository.deleteUser(user.id);
  }

  async updateUserPassword(user: User, newPassword: string): Promise<string> {
    const { id, password } = user;
    this.logger.log(newPassword);
    const salt = await bcrypt.genSalt();
    newPassword = await bcrypt.hash(newPassword, salt);
    this.logger.log(newPassword);
    if (password === newPassword) {
      throw new HttpException(
        'New password is equal to old password',
        HttpStatus.OK,
      );
    }
    return await this.userRepository.updatePassword(newPassword, id);
  }
}
