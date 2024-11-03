import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class UserRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    role_name: string;
}