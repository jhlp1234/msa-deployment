import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  async create(createUserDto: CreateUserDto){
    const {email, password} = createUserDto;

    const user = await this.userRepository.findOne({where: {email}});
    if(user) throw new BadRequestException('존재하는 사용자');

    const hash = await bcrypt.hash(password, 10);

    return this.userRepository.save({...createUserDto, email, password: hash});
  }

  async getUserById(userId: string){
    const user = await this.userRepository.findOneBy({id: userId});
    if(!user) throw new BadRequestException('잘못된 user id');

    return user;
  }
}
