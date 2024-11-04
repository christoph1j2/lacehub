import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('reviews')
@Unique(['reviewerId', 'sellerId'])
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()  // Explicitly add reviewerId as a column
    reviewerId: number;

    @Column()  // Explicitly add sellerId as a column
    sellerId: number;

    @ManyToOne(() => User, (user) => user.reviewsAsReviewer)
    @JoinColumn({ name: 'reviewerId', referencedColumnName: 'id' })
    reviewer: User;

    @ManyToOne(() => User, (user) => user.reviewsAsSeller)
    @JoinColumn({ name: 'sellerId', referencedColumnName: 'id' })
    seller: User;

    @Column()
    rating: boolean;

    @Column()
    review_text: string;

    @Column()
    createdAt: Date;
}
