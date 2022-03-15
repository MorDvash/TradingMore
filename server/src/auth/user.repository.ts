import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('AuthRepository', { timestamp: true });

  async createUser(authCredentialDto: AuthCredentialsDto): Promise<void> {
    const { userName, password } = authCredentialDto;
    const user = this.create({ userName, password });
    this.logger.verbose(`"${user.userName}" was created`);
    try {
      await this.save(user);
      this.logger.verbose(`"${user.userName}" was saved`);
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

  async deleteUser(id: string): Promise<string> {
    try {
      await this.delete(id);
      this.logger.verbose(`user "${id}" was deleted`);
      return 'User was delete';
    } catch (error) {
      this.logger.error(`Failed to delete user "${id}".`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async updatePassword(newPassword: string, id: string): Promise<string> {
    try {
      this.logger.log(id);
      await this.update({ id: id }, { password: newPassword });
      this.logger.verbose(`user "${id}" Password was Update`);
      return 'Password was update';
    } catch (error) {
      this.logger.error(`Failed to Update user "${id}". Password`, error.stack);
      throw new InternalServerErrorException();
    }
  }
}
