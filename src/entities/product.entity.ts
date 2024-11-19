import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserInventory } from './userInventory.entity';
import { Wts } from './wts.entity';
import { Wtb } from './wtb.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    sku: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    image_link: string;

    @Column()
    created_at: Date;

    @OneToMany(() => UserInventory, (userInventory) => userInventory.product)
    inventory: UserInventory[];

    @OneToMany(() => Wts, (wts) => wts.product)
    wts: Wts[];

    @OneToMany(() => Wtb, (wtb) => wtb.product)
    wtb: Wtb[];
}
