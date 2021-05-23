export const MILLISECONDS_IN_WEEK = 604800000
export const COMPARISON_DICT = {
  ">": function (x, y) {
    return x > y
  },
  "<": function (x, y) {
    return x < y
  },
}

export enum ROLL_STATE_TYPES {
  UNMARK = "unmark",
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
}

export enum LTMT_TYPES {
  LESS_THAN = "<",
  MORE_THAN = ">",
}
