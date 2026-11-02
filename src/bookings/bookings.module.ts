
import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { FieldsModule } from '../fields/fields.module';

@Module({
  imports: [FieldsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
