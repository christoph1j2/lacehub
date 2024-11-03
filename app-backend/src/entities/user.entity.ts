import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { UserRole } from 'src/entities/user-role.entity'; // assuming you have a UserRole entity
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
    passwordHash: string;

    @ManyToOne(() => UserRole, (userRole) => userRole.id)
    @JoinColumn({ name: 'role_id' })
    role: UserRole;

    @Column({ default:false })
    verified: boolean;

    @Column()
    createdAt: Date;

    @Column({ default:0 })
    credScore: number;

    @Column({ default:false })
    isBanned: boolean;

    @Column({ nullable:true })
    banExpiration: Date;

    @OneToMany(() => UserInventory, (userInventory) => userInventory.user)
    inventory: UserInventory[];

    @OneToMany(() => Review, (review) => review.reviewer)
    reviewsAsReviewer: Review[];

    @ManyToOne(() => Review, (review) => review.seller)
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