import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('reviews')
@Unique(['reviewer_id', 'seller_id'])
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column() // Explicitly add reviewerId as a column
    reviewer_id: number;

    @Column() // Explicitly add sellerId as a column
    seller_id: number;

    @ManyToOne(() => User, (user) => user.reviewsAsReviewer)
    @JoinColumn({ name: 'reviewer_id', referencedColumnName: 'id' })
    reviewer: User;

    @ManyToOne(() => User, (user) => user.reviewsAsSeller)
    @JoinColumn({ name: 'seller_id', referencedColumnName: 'id' })
    seller: User;

    @Column()
    rating: boolean;

    @Column()
    review_text: string;

    @Column()
    created_at: Date;
}
