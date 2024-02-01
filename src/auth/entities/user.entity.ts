import { Mail } from 'src/inbox/entities/mail.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ length: 120 })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  password: string;

  @Column()
  box: string;

  @OneToMany(() => Mail, (mail) => mail.user)
  mails: Mail[];
}
