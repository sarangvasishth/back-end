import { NextFunction, Request, Response } from "express"
import ErrorHandler from "../utils/errorHandler"

function errorMiddleware(error: ErrorHandler, request: Request, response: Response, next: NextFunction) {
  const status = error.status || 500
  const message = error.message || "Something went wrong"
  response.status(status).send({
    success: false,
    message,
  })
}

export default errorMiddleware
