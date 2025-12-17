import { UUID } from 'node:crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { STATE } from '../types';

@Entity({ name: 'snapshots' })
export class Snapshot {
  @PrimaryColumn('uuid')
  orderId: UUID

  @Column({ type: 'jsonb' })
  snapshot: unknown

  @Column({type: 'enum', enum: STATE})
  state: STATE

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(orderId: UUID, state: STATE, snapshot: unknown) {
	  this.orderId = orderId
	  this.snapshot = snapshot
	  this.state = state;
  }
}
