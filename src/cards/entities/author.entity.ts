import { Prop } from '@nestjs/mongoose';
import { Multimedia } from './multimedia.entity';
import { Location } from './location.entity';

// Definition of the Author Object

export class Author {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  dateOfBirth: string;

  @Prop()
  dateOfDeath: string;

  @Prop({
    type: Location,
    required: false,
  })
  placeOfBirth?: Location;

  @Prop({
    type: Location,
    required: false,
  })
  placeOfDeath?: Location;

  @Prop()
  gender: string;

  @Prop()
  pseudonym: string;

  @Prop()
  relevantActivities: string;

  @Prop()
  parents: string[];

  @Prop()
  siblings: string[];

  @Prop()
  children: string[];

  @Prop()
  mainTheme: string;

  @Prop()
  mainGenre: string;

  @Prop()
  context: string;

  @Prop()
  image: string;

  @Prop({
    type: Multimedia,
    required: false,
  })
  multimedia?: Multimedia;

  @Prop()
  audio: string;
}
