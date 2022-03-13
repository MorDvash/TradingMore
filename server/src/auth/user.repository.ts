import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('AuthRepository', { timestamp: true });

  async createUser(authCredentialDto: AuthCredentialsDto): Promise<void> {
    const { userName, password } = authCredentialDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({ userName, password: hashedPassword });
    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate username (need to make other file for handling error)
        this.logger.error(
          `Failed to create user "${user.userName} because already exists".`,
          error.stack,
        );
        throw new ConflictException('Username already exists');
      } else {
        this.logger.error(
          `Failed to create user "${user.userName}".`,
          error.stack,
        );
        throw new InternalServerErrorException();
      }
    }
  }
}
