import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    // ✅ esto quita el error de defaultStrategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwtSecret'),
        signOptions: { expiresIn: '365d' }, // o lo que uses
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],

  // ✅ exporta para que otros módulos con AuthGuard() 
  exports: [PassportModule, JwtModule, JwtStrategy],
})
export class UsersModule {}
