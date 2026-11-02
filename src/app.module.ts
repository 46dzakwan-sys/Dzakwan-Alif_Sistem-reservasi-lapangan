import { Module } from '@nestjs/common';
import { FieldsModule } from './fields/fields.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [FieldsModule, BookingsModule],
})
export class AppModule {}
