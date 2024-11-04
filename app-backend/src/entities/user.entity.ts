import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { Role } from 'src/entities/role.entity';
import { UserInventory } from './userInventory.entity';
import { Review } from './review.entity';
import { Report } from './report.entity';
import { Match } from './match.entity';


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

    @Column({ default:false })
    verified: boolean;

    @Column()
    created_at: Date;

    @Column({ default:0 })
    credibility_score: number;

    @Column({ default:false })
    is_banned: boolean;

    @Column({ nullable:true })
    ban_expiration: Date;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    /*@OneToMany(() => UserInventory, (userInventory) => userInventory.user)
    inventory: UserInventory[];

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
    matchesAsSeller: Match[];*/
}