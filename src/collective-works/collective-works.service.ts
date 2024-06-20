import { Injectable } from '@nestjs/common';
import { CreateCollectiveWorkDto } from './dto/create-collective-work.dto';
import { UpdateCollectiveWorkDto } from './dto/update-collective-work.dto';

@Injectable()
export class CollectiveWorksService {
  create(createCollectiveWorkDto: CreateCollectiveWorkDto) {
    return 'This action adds a new collectiveWork';
  }

  findAll() {
    return `This action returns all collectiveWorks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} collectiveWork`;
  }

  update(id: number, updateCollectiveWorkDto: UpdateCollectiveWorkDto) {
    return `This action updates a #${id} collectiveWork`;
  }

  remove(id: number) {
    return `This action removes a #${id} collectiveWork`;
  }
}
