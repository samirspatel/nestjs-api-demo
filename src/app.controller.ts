import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: Response) {
    // Try dist/public first (production), then public (development)
    const publicPath = join(__dirname, '..', 'public', 'index.html');
    res.sendFile(publicPath);
  }
}
