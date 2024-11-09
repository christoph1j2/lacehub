import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Wts } from './wts.entity';
import { Wtb } from './wtb.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wtb, (wtb) => wtb.matches)
  @JoinColumn({ name: 'wtb_id' })
  wtb: Wtb;

  @ManyToOne(() => Wts, (wts) => wts.matches)
  @JoinColumn({ name: 'wts_id' })
  wts: Wts;

  @ManyToOne(() => User, (user) => user.matchesAsBuyer)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User, (user) => user.matchesAsSeller)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column()
  match_score: number;

  @Column()
  createdAt: Date;

  @Column()
  status: string;
}
