import { Inject, Injectable } from '@nestjs/common';
import fs from 'fs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import path from 'path';
import sharp from 'sharp';
import { Logger } from 'winston';

@Injectable()
export class ImageService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}
  async saveTo(
    dir: string,
    image: Express.Multer.File,
    filename?: string,
  ): Promise<string> {
    if (!filename) {
      filename = await this.generateRandomFilename();
    }

    const directory = path.join('uploads', dir);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    await sharp(image.buffer)
      .resize(1000)
      .webp({ effort: 3 })
      .toFile(path.join('uploads', dir, filename));

    return `/uploads/${dir}/${filename}`;
  }

  async removeFile(dir: string): Promise<void> {
    try {
      if (dir.startsWith('/')) dir = dir.substring(1);

      if (fs.existsSync(path.resolve(dir))) {
        fs.unlinkSync(path.resolve(dir));
      }
    } catch (error) {
      this.logger.error('Error deleting file: ' + error);
    }
  }
  async generateRandomFilename(): Promise<string> {
    return (
      Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('') + '.webp'
    );
  }
}
