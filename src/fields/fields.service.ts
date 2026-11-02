
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FieldsService {
  private fields = [
    {
      id: 1,
      name: 'Lapangan Futsal',
      sportType: 'Futsal',
      pricePerHour: 80000,
      status: 'AVAILABLE',
    },
    {
      id: 2,
      name: 'Lapangan Badminton',
      sportType: 'Badminton',
      pricePerHour: 50000,
      status: 'AVAILABLE',
    },
    {
      id: 3,
      name: 'Lapangan Basket',
      sportType: 'Basket',
      pricePerHour: 50000,
      status: 'AVAILABLE',
    },
  ];

  findAll() {
    return this.fields;
  }

  findOne(id: number) {
    const field = this.fields.find(item => item.id === id);

    if (!field) {
      throw new NotFoundException({
        message: 'Lapangan tidak ditemukan',
      });
    }

    return field;
  }
}
