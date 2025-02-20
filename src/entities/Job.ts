import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

// Improved enum with more descriptive states
export enum JobStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  MAINTENANCE_QUEUED = "MAINTENANCE_QUEUED",
  CANCELLED = "CANCELLED", // New state
  RETRY_QUEUED = "RETRY_QUEUED", // New state
}

// Type for job configuration
export interface JobConfig {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  timeout?: number; // milliseconds
}

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({ type: "timestamp" })
  declare runAt: Date;

  @Column()
  declare jobType: string;

  @Column({
    type: "enum",
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  declare status: JobStatus;

  @Column({
    type: "varchar",
  })
  declare referenceId: string; // Using unknown instead of any for better type safety

  @Column({
    type: "varchar",
  })
  declare entity: string;

  @Column({ default: 0 })
  declare retryCount: number;

  @Column({ nullable: true })
  declare lastError?: string;

  @Column({ type: "json", nullable: true })
  declare jobConfig?: JobConfig;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}
