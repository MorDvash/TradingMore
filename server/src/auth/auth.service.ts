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
import { HttpService } from '@nestjs/axios';
import {map, Observable} from "rxjs";

interface Res {
  name: string;
  height: number;
}

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService', { timestamp: true });
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService,
    private httpService: HttpService
  ) {}

  async signUp(authCredential: AuthCredentialsDto): Promise<any> {
    const salt = await bcrypt.genSalt();
    authCredential.password = await bcrypt.hash(authCredential.password, salt);
    await this.userRepository.createUser(authCredential);
    try {
      // return await this.httpService.post('https://swapi.py4e.com/api/people/1', {
      //   name: 'mor'
      // })
      return this.httpService.post(' https://ypff6jjzk5.execute-api.eu-west-2.amazonaws.com/dev/sendEmail', {
        name: 'Mor'
      }).pipe(
          map(response => response.data),
      );
    } catch (error) {
      this.logger.log('axios fai;d')
      this.logger.error('axios faild',error.stack)
    }
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
    const salt = await bcrypt.genSalt();
    newPassword = await bcrypt.hash(newPassword, salt);
    if (password === newPassword) {
      throw new HttpException(
        'New password is equal to old password',
        HttpStatus.OK,
      );
    }
    return await this.userRepository.updatePassword(newPassword, id);
  }
}
