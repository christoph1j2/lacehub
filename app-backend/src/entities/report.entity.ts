import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
import { User } from './user.entity';

@Entity('reports')
export class Report {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reportsAsReported)
    @JoinColumn({ name: 'reported_user_id' })
    reportedUser: User;

    @ManyToOne(() => User, (user) => user.reportsAsReporter)
    @JoinColumn({ name: 'reporter_user_id' })
    reporterUser: User;

    @Column()
    report_text: string;

    @Column()
    report_date: Date;

    @Column()
    resolved: boolean;

    @Column()
    action_taken: string;
}