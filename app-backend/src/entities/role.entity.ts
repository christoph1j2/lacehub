import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity'; // Ensure the path is correct

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Relationship with User entity
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
