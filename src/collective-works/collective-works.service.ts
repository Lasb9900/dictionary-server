import { Injectable } from '@nestjs/common';
import { CreateCollectiveWorksDto } from './dto/create-collective-work.dto';
import { UpdateCollectiveWorkDto } from './dto/update-collective-work.dto';

@Injectable()
export class CollectiveWorksService {
  create(createCollectiveWorkDto: CreateCollectiveWorksDto) {
    return createCollectiveWorkDto;
  }

  findAll() {
    return `This action returns all collectiveWorks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} collectiveWork`;
  }

  update(id: number, updateCollectiveWorkDto: UpdateCollectiveWorkDto) {
    return updateCollectiveWorkDto;
  }

  remove(id: number) {
    return `This action removes a #${id} collectiveWork`;
  }
}
