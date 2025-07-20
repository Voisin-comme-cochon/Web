import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Newspaper {
  readonly id?: string;
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  neighborhoodId!: string;

  @Prop({ required: true, type: Object })
  content!: any;

  @Prop({ required: false })
  profileImageUrl?: string;

  @Prop({ required: false })
  title?: string;

  @Prop({ type: [Number], required: false })
  tagIds?: number[];
}

export const NewspaperSchema = SchemaFactory.createForClass(Newspaper); 