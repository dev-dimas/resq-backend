import { Injectable } from '@nestjs/common';

@Injectable()
export class CamelTransformService {
  constructor() {}
  private toCamelCase(snakeStr: string): string {
    return snakeStr.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
  }

  convertKeysToCamelCase<T extends object>(
    obj: T,
  ): {
    [K in keyof T as K extends string
      ? ReturnType<typeof this.toCamelCase>
      : K]: T[K];
  } {
    const newObj: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = this.toCamelCase(key);
        newObj[newKey] = obj[key];
      }
    }

    return newObj;
  }
}
