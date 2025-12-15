import { UUID } from 'node:crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'snapshots' })
export class Snapshot {
  @PrimaryColumn('uuid')
  orderId: UUID

  @Column({ type: 'jsonb' })
  snapshot: unknown

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(orderId: UUID, snapshot: unknown) {
	  this.orderId = orderId
	  this.snapshot = snapshot
  }
}
