import { CreateEmployeeDto, EmployeeLoginDto } from '@dtos/employee/employee.dto';
import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';

class AuthRoute implements Routes {
  public path = '/api/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}login`, validationMiddleware(EmployeeLoginDto, 'body'), this.authController.logIn);
    this.router.post(`${this.path}signup`, validationMiddleware(CreateEmployeeDto, 'body'), this.authController.SignUp);
    this.router.post(`${this.path}logout`, authMiddleware, this.authController.logOut);
  }
}

export default AuthRoute;
