import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { UserInventory } from './userInventory.entity';
import { Review } from './review.entity';
import { Report } from './report.entity';
import { Match } from './match.entity';
import { Wts } from './wts.entity';
import { Wtb } from './wtb.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password_hash: string;

    @Column({ default: 2 })
    role_id: number;

    @Column({ nullable: true })
    verificationToken: string;

    @Column({ default: false })
    verified: boolean;

    @Column()
    created_at: Date;

    @Column({ default: 0 })
    credibility_score: number;

    @Column({ default: false })
    is_banned: boolean;

    @Column({ nullable: true })
    ban_expiration: Date;

    @Column({ nullable: true })
    resetToken: string;

    @Column({ nullable: true })
    resetTokenExpires: Date;

    @ManyToOne(() => Role, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @OneToMany(() => UserInventory, (userInventory) => userInventory.user)
    inventory: UserInventory[];

    @OneToMany(() => Wts, (wts) => wts.user)
    wts: Wts[];

    @OneToMany(() => Wtb, (wtb) => wtb.user)
    wtb: Wtb[];

    @OneToMany(() => Review, (review) => review.reviewer)
    reviewsAsReviewer: Review[];

    @OneToMany(() => Review, (review) => review.seller)
    reviewsAsSeller: Review[];

    @OneToMany(() => Report, (report) => report.reportedUser)
    reportsAsReported: Report[];

    @OneToMany(() => Report, (report) => report.reporterUser)
    reportsAsReporter: Report[];

    @OneToMany(() => Match, (match) => match.buyer)
    matchesAsBuyer: Match[];

    @OneToMany(() => Match, (match) => match.seller)
    matchesAsSeller: Match[];
}
