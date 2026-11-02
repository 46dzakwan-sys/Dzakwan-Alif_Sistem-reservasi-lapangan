import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { BookingsService } from './bookings.service';

@Controller()
export class BookingsController {

  constructor(
    private readonly bookingsService: BookingsService,
  ) {}

  // Membuat booking
  @Post('bookings')
  create(@Body() data: any) {
    return this.bookingsService.create(data);
  }

  // Melihat detail booking
  @Get('bookings/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  // Melihat booking berdasarkan user
  @Get('users/:userId/bookings')
  findByUser(@Param('userId') userId: string) {
    return this.bookingsService.findByUser(userId);
  }

  // Membatalkan booking
  @Patch('bookings/:id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancel(id);
  }

  // Mengecek ketersediaan lapangan
  @Get('fields/:id/availability')
  availability(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ) {
    return this.bookingsService.availability(id, date);
  }

}
