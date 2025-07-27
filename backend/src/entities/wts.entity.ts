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

@Entity('wts')
export class Wts {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.wts)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product, (product) => product.wts)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column()
    size: string;

    @Column()
    quantity: number;

    @OneToMany(() => Match, (match) => match.wts)
    matches: Match[];
}
