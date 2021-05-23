import * as _ from "lodash"

import { getRepository, getConnection, MoreThan } from "typeorm"
import { Roll } from "../entity/roll.entity"
import { Group } from "../entity/group.entity"
import { Student } from "../entity/student.entity"
import { GroupStudent } from "../entity/group-student.entity"
import { StudentRollState } from "../entity/student-roll-state.entity"
import { NextFunction, Request, Response } from "express"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"
import { CreateGroupStudentInput } from "../interface/group-student.interface"

import ErrorHandler from "../utils/errorHandler"

import { createGroupSchema, updateGroupSchema, getErrorMeassages } from "../utils/validation"
import { COMPARISON_DICT, MILLISECONDS_IN_WEEK } from "../constants"

export class GroupController {
  private groupRepository = getRepository(Group)
  private studentRepository = getRepository(Student)
  private groupStudentRepository = getRepository(GroupStudent)

  async allGroups(request: Request, response: Response, next: NextFunction) {
    try {
      const groups = await this.groupRepository.find()

      response.status(200).json({
        success: true,
        data: { groups },
      })
      return
    } catch (err) {
      next(new ErrorHandler(500, err.message))
    }
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request

    try {
      await createGroupSchema.validateAsync(params)

      const createGroupInput: CreateGroupInput = {
        name: params.name,
        number_of_weeks: params.number_of_weeks,
        roll_states: params.roll_states,
        incidents: params.incidents,
        ltmt: params.ltmt,
        run_at: params.run_at,
        student_count: params.student_count,
      }

      const group = new Group()
      group.prepareToCreate(createGroupInput)

      const res = await this.groupRepository.save(group)

      response.status(200).json({
        success: true,
        data: { group: res },
      })
      return
    } catch (err) {
      if (err.details) {
        err.message = getErrorMeassages(err.details)
      }

      next(new ErrorHandler(500, err.message))
    }
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request

    try {
      await updateGroupSchema.validateAsync(params)
      const group = await this.groupRepository.findOne(params.id)

      if (!group) {
        next(new ErrorHandler(400, "Group doesn't exist."))
      }

      const updateGroupInput: UpdateGroupInput = {
        id: params.id,
        name: params.name,
        number_of_weeks: params.number_of_weeks,
        roll_states: params.roll_states,
        incidents: params.incidents,
        ltmt: params.ltmt,
        run_at: params.run_at,
        student_count: params.student_count,
      }

      group.prepareToUpdate(updateGroupInput)

      const res = await this.groupRepository.save(group)

      response.status(200).json({
        success: true,
        data: { group: res },
      })
      return
    } catch (err) {
      if (err.details) {
        err.message = getErrorMeassages(err.details)
      }

      next(new ErrorHandler(500, err.message))
    }
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    if (!request.params.id) {
      next(new ErrorHandler(400, "Group Id is required."))
    }
    try {
      let groupToRemove = await this.groupRepository.findOne(request.params.id)

      if (!groupToRemove) {
        next(new ErrorHandler(400, "Group doesn't exist."))
      }

      await this.groupRepository.remove(groupToRemove)

      response.status(200).json({
        success: true,
        data: {},
        message: `Group with ${request.params.id} successfully removed.`,
      })
      return
    } catch (err) {
      next(new ErrorHandler(500, err.message))
    }
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    if (!request.params.groupId) {
      next(new ErrorHandler(400, "Group Id is required."))
    }

    try {
      const studentsInGroup = await this.groupStudentRepository.find({ group_id: request.params.groupId })

      // this loop can be avoided using foreign keys.
      // didn't used foreign keys to save development time.
      // although using parallel queries though Promise.all to save execution time.
      const students = await Promise.all(
        studentsInGroup.map((studentGroup) => {
          return new Promise((resolve, reject) => {
            this.studentRepository
              .findOne({ id: studentGroup.student_id })
              .then((student) => {
                resolve({
                  id: student.id,
                  first_name: student.first_name,
                  last_name: student.last_name,
                  full_name: `${student.first_name} ${student.last_name}`,
                })
              })
              .catch((err) => {
                reject(err)
              })
          })
        })
      )

      response.status(200).json({
        success: true,
        data: { students },
      })
      return
    } catch (err) {
      next(new ErrorHandler(500, err.message))
    }
  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    const connection = getConnection()
    const queryRunner = connection.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
    } catch (err) {
      next(new ErrorHandler(500, err.message))
    }

    try {
      // 1. Clear out the groups (delete all the students from the groups)
      await queryRunner.manager.getRepository(GroupStudent).delete({})

      // transaction check
      // const items = await queryRunner.manager.find(GroupStudent)
      // console.log(items)
      // console.log(items.length)
      // throw new Error("Transaction failed")

      // 2. For each group, query the student rolls to see which students match the filter for the group
      const groups = await queryRunner.manager.find(Group)

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const afterTime = new Date(Date.now() - group.number_of_weeks * MILLISECONDS_IN_WEEK)

        const rolls = await queryRunner.manager.getRepository(Roll).find({ completed_at: MoreThan(afterTime) })
        const rollIds = rolls.map((roll) => roll.id)

        const studentRollStates = await queryRunner.manager
          .getRepository(StudentRollState)
          .createQueryBuilder("studentRollStates")
          .where("studentRollStates.roll_id IN (:...ids)", {
            ids: rollIds,
          })
          .andWhere("studentRollStates.state = :state", { state: group.roll_states })
          .getMany()

        const studentOccurences = _.countBy(studentRollStates, "student_id")
        const studentIdsArray = Object.keys(studentOccurences).filter((key) => COMPARISON_DICT[group.ltmt](studentOccurences[key], group.incidents))

        // 3. Add the list of students that match the filter to the group
        for (let j = 0; j < studentIdsArray.length; j++) {
          const studentId = studentIdsArray[i]
          const createGroupStudentInput: CreateGroupStudentInput = {
            group_id: group.id,
            student_id: parseInt(studentId),
            incident_count: studentOccurences[studentId],
          }
          const groupStudent = new GroupStudent()
          groupStudent.prepareToCreate(createGroupStudentInput)
          await queryRunner.manager.getRepository(GroupStudent).save(groupStudent)
        }
        const updateGroupInput: UpdateGroupInput = {
          id: group.id,
          name: group.name,
          number_of_weeks: group.number_of_weeks,
          roll_states: group.roll_states,
          incidents: group.incidents,
          ltmt: group.ltmt,
          run_at: new Date(),
          student_count: studentIdsArray.length,
        }
        group.prepareToUpdate(updateGroupInput)
        await queryRunner.manager.getRepository(Group).save(group)
      }
      await queryRunner.commitTransaction()

      response.status(200).json({
        success: true,
        data: {},
        message: "Group filters ran successfully.",
      })
      return
    } catch (err) {
      await queryRunner.rollbackTransaction()
      next(new ErrorHandler(500, err.message))
    } finally {
      await queryRunner.release()
    }
  }
}
