import { Column, Entity, ObjectIdColumn } from 'typeorm'

@Entity()
export class Product {
    @ObjectIdColumn()
    id: string

    @Column({ unique: true })
    adminId: number

    @Column()
    title: string

    @Column({ default: 0 })
    likes: number
}