import { getRepository } from "typeorm"
import { Group } from "../entity/group.entity"

import { NextFunction, Request, Response } from "express"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"

import ErrorHandler from "../utils/errorHandler"

import { createGroupSchema, getErrorMeassages } from "../utils/validation"

export class GroupController {
  private groupRepository = getRepository(Group)

  async allGroups(request: Request, response: Response, next: NextFunction) {
    return this.groupRepository.find()
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
        data: res,
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

    console.log(params.id)

    try {
      const group = await this.groupRepository.findOne(params.id)
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

      return await this.groupRepository.save(group)
    } catch (err) {
      console.log("errerrerrerrerrerrerrerrerrerrerrerr")
      console.log(err)
    }
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    let groupToRemove = await this.groupRepository.findOne(parseInt(request.params.id))
    await this.groupRepository.remove(groupToRemove)
    return { message: `Group with ${request.params.id} successfully removed.` }
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of Students that are in a Group
  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
    // 1. Clear out the groups (delete all the students from the groups)
    // 2. For each group, query the student rolls to see which students match the filter for the group
    // 3. Add the list of students that match the filter to the group
  }
}
