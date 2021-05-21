import { LTMT_TYPES, ROLL_STATE_TYPES } from "../constants/enumTypes"

export interface CreateGroupInput {
  name: string
  number_of_weeks: number
  roll_states: ROLL_STATE_TYPES
  incidents: number
  ltmt: LTMT_TYPES
  run_at: Date
  student_count: number
}
