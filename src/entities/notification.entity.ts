import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Match, (match) => match.id)
    @JoinColumn({ name: 'match_id' })
    match: Match;

    @Column()
    type: string;

    @Column()
    message: string;

    @Column()
    isRead: boolean;

    @Column()
    createdAt: Date;
}
