import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Domain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
