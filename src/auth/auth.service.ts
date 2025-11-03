import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: RegisterDto) {
    const userExist = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (userExist) {
      throw new BadRequestException('User already exist');
    }

    const hash = await this.hashPassword(registerDto.password);

    const user = await this.userModel.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hash,
    });

    const payload = {
      sub: user._id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };

    const token = await this.generateToken(payload);
    return {
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const userExist = await this.userModel.findOne({
      email: loginDto.email,
    });

    if (!userExist) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await this.comparePassword(
      loginDto.password,
      userExist.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Password mismatch');
    }

    const payload = {
      sub: userExist._id,
      user: {
        id: userExist.id,
        email: userExist.email,
        name: userExist.name,
        avatar: userExist.avatar,
      },
    };

    const token = await this.generateToken(payload);
    return {
      token,
    };
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }
  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async generateToken(payload: any) {
    return await this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
