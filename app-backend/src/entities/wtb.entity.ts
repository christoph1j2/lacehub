import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Match } from './match.entity';

@Entity('wtb')
export class Wtb {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.inventory)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product, (product) => product.inventory)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column()
    size: string;

    @Column()
    quantity: number;

    @OneToMany(() => Match, (match) => match.wtb)
    matches: Match[];
}