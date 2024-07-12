import { Injectable } from '@nestjs/common';

@Injectable()
export class HaversineService {
  calculateDistance(
    latitudeFrom: string | number,
    longitudeFrom: string | number,
    latitudeTo: string | number,
    longitudeTo: string | number,
  ): number {
    latitudeFrom = this.strCoordinateToNumber(latitudeFrom);
    longitudeFrom = this.strCoordinateToNumber(longitudeFrom);
    latitudeTo = this.strCoordinateToNumber(latitudeTo);
    longitudeTo = this.strCoordinateToNumber(longitudeTo);

    const R = 6371; // Jari jari bumi dalam satuan kilometer

    const dLat = this.toRadians(latitudeTo - latitudeFrom);
    const dLon = this.toRadians(longitudeTo - longitudeFrom);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(latitudeFrom)) *
        Math.cos(this.toRadians(latitudeTo)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private strCoordinateToNumber(coordinate: string | number): number {
    if (typeof coordinate === 'string') {
      return parseFloat(coordinate);
    }
    return coordinate;
  }
}
