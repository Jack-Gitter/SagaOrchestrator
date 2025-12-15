import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'snapshots' })
export class StateMachineSnapshotEntity {
  @PrimaryColumn('int')
  orderId: number

  @Column({ type: 'jsonb' })
  snapshot: unknown

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(orderId: number, snapshot: unknown) {
	  this.orderId = orderId
	  this.snapshot = snapshot
  }
}
