import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Newspaper {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  neighborhoodId!: string;

  @Prop({ required: true, type: Object })
  content!: any;
}

export const NewspaperSchema = SchemaFactory.createForClass(Newspaper); 