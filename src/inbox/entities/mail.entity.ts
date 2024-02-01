import { User } from 'src/auth/entities/user.entity';
import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Mail {
  @PrimaryColumn()
  id: number;

  @Column()
  from: string;

  @Column()
  subject: string;

  @Column()
  text: string;

  @Column()
  date: Date;

  @ManyToOne(() => User, (user) => user.mails)
  user: User;
}
