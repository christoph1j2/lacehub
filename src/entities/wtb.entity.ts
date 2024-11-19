import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { Match } from './match.entity';
import { User } from './user.entity';

@Entity('wtb')
export class Wtb {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.wtb)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product, (product) => product.wtb)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column()
    size: string;

    @Column()
    quantity: number;

    @OneToMany(() => Match, (match) => match.wtb)
    matches: Match[];
}
