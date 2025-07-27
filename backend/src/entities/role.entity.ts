import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('user_roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    role_name: string;

    // Relationship with User entity
    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
