import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { CreateGroupInput } from "../interface/group.interface"

import { LTMT_TYPES, ROLL_STATE_TYPES } from "../constants/enumTypes"

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  number_of_weeks: number

  @Column({ type: "simple-enum", enum: ROLL_STATE_TYPES })
  roll_states: ROLL_STATE_TYPES

  @Column()
  incidents: number

  @Column({ type: "simple-enum", enum: LTMT_TYPES })
  ltmt: LTMT_TYPES

  @Column({
    nullable: true,
  })
  run_at: Date

  @Column()
  student_count: number

  public prepareToCreate(input: CreateGroupInput) {
    this.name = input.name
    this.number_of_weeks = input.number_of_weeks
    this.roll_states = input.roll_states
    this.incidents = input.incidents
    this.ltmt = input.ltmt
    this.student_count = 0
  }
}
