import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ClerkStrategy } from './clerk.strategy';

@Module({
  providers: [AuthGuard, ClerkStrategy],
  exports: [AuthGuard, ClerkStrategy],
})
export class AuthModule {}
