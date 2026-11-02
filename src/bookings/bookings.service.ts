
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { FieldsService } from '../fields/fields.service';

// Tipe data reservasi
export interface Booking {
  id: number;
  fieldId: number;
  fieldName: string;
  userId: string;
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
}

@Injectable()
export class BookingsService {

  // Penyimpanan sementara menggunakan array
  private bookings: Booking[] = [];

  private nextId: number = 1;

  constructor(
    private readonly fieldsService: FieldsService,
  ) {}

  // Membuat reservasi baru
  create(data: any) {

    const {
      fieldId,
      userId,
      date,
      startTime,
      endTime,
      customerName,
    } = data;

    // Validasi data
    if (
      !fieldId ||
      !userId ||
      !date ||
      !startTime ||
      !endTime ||
      !customerName
    ) {
      throw new BadRequestException(
        'Semua data booking wajib diisi',
      );
    }

    // Mengecek lapangan
    const field = this.fieldsService.findOne(
      Number(fieldId),
    );

    // Validasi waktu
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (
      !timePattern.test(startTime) ||
      !timePattern.test(endTime)
    ) {
      throw new BadRequestException(
        'Format jam harus HH:mm',
      );
    }

    if (startTime >= endTime) {
      throw new BadRequestException(
        'Jam selesai harus lebih besar dari jam mulai',
      );
    }

    // Validasi tanggal
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
      !datePattern.test(date) ||
      Number.isNaN(Date.parse(date)) ||
      new Date(`${date}T00:00:00Z`)
        .toISOString()
        .slice(0, 10) !== date
    ) {
      throw new BadRequestException(
        'Format tanggal tidak valid',
      );
    }

    // Mengecek jadwal bentrok
    const conflict = this.bookings.find(
      (booking) =>
        booking.fieldId === Number(fieldId) &&
        booking.date === date &&
        booking.status === 'BOOKED' &&
        startTime < booking.endTime &&
        endTime > booking.startTime,
    );

    if (conflict) {
      throw new ConflictException({
        message: 'Jadwal lapangan sudah dipesan',
        conflictBookingId: conflict.id,
      });
    }

    // Menghitung durasi dan harga
    const start =
      Number(startTime.substring(0, 2)) * 60 +
      Number(startTime.substring(3, 5));

    const end =
      Number(endTime.substring(0, 2)) * 60 +
      Number(endTime.substring(3, 5));

    const duration = (end - start) / 60;

    const totalPrice =
      duration * field.pricePerHour;

    // Membuat data booking
    const booking: Booking = {
      id: this.nextId++,
      fieldId: Number(fieldId),
      fieldName: field.name,
      userId: String(userId),
      customerName: customerName,
      date: date,
      startTime: startTime,
      endTime: endTime,
      totalPrice: totalPrice,
      status: 'BOOKED',
    };

    this.bookings.push(booking);

    return {
      message: 'Reservasi berhasil dibuat',
      data: booking,
    };
  }

  // Melihat detail booking
  findOne(id: number) {

    const booking = this.bookings.find(
      (item) => item.id === id,
    );

    if (!booking) {
      throw new NotFoundException(
        'Booking tidak ditemukan',
      );
    }

    return booking;
  }

  // Melihat booking berdasarkan user
  findByUser(userId: string) {

    return this.bookings.filter(
      (item) => item.userId === userId,
    );
  }

  // Membatalkan booking
  cancel(id: number) {

    const booking = this.findOne(id);

    if (booking.status === 'CANCELLED') {
      throw new ConflictException(
        'Booking sudah dibatalkan',
      );
    }

    if (booking.status === 'COMPLETED') {
      throw new ConflictException(
        'Booking sudah selesai',
      );
    }

    booking.status = 'CANCELLED';

    return {
      message: 'Reservasi berhasil dibatalkan',
      data: booking,
    };
  }

  // Mengecek ketersediaan lapangan
  availability(fieldId: number, date: string) {

    // Mengecek apakah lapangan tersedia
    this.fieldsService.findOne(fieldId);

    // Validasi tanggal
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
      !datePattern.test(date) ||
      Number.isNaN(Date.parse(date)) ||
      new Date(`${date}T00:00:00Z`)
        .toISOString()
        .slice(0, 10) !== date
    ) {
      throw new BadRequestException(
        'Tanggal tidak valid',
      );
    }

    // Mengambil jadwal yang sudah dipesan
    const bookedSlots = this.bookings.filter(
      (item) =>
        item.fieldId === fieldId &&
        item.date === date &&
        item.status === 'BOOKED',
    );

    return {
      fieldId: fieldId,
      date: date,
      bookedSlots: bookedSlots,
      message: 'Data ketersediaan berhasil ditampilkan',
    };
  }

}
