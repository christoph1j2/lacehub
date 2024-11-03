import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, OneToMany} from 'typeorm';
import { User } from './user.entity';

@Entity('reviews')
@Unique(['reviewer_id', 'seller_id'])
export class Review {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reviewsAsReviewer)
    @JoinColumn({ name: 'reviewer_id' })
    reviewer: User;

    @OneToMany(() => User, (user) => user.reviewsAsSeller)
    @JoinColumn({ name: 'seller_id' })
    seller: User;

    @Column()
    rating: boolean;

    @Column()
    review_text: string;

    @Column()
    createdAt: Date;
}