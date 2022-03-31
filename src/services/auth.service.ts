/* eslint-disable prettier/prettier */
import { generateOGID } from './../utils/util';
import  EmployeeService  from '@services/employee.service';
import config from 'config';
import jwt from 'jsonwebtoken';
import EmployeeModel from '@models/employee/employee.model';
import { CreateEmployeeDto, EmployeeLoginDto } from '@dtos/employee/employee.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import bcrypt from 'bcrypt';
import { compare } from 'bcrypt';
import { Employee } from '@interfaces/employee-interface/employee.interface';

import { isEmpty } from '@utils/util';

class AuthService {
  private Employees = EmployeeModel;
  private empS = new EmployeeService()
  public async signup(EmployeeData: CreateEmployeeDto): Promise<{ token: any; findUser: Employee }> {
    if (isEmpty(EmployeeData)) throw new HttpException(400, "No EmployeeData given");

    const findEmployee: Employee = await this.Employees.findOne({ company_email: EmployeeData.company_email });

    if (findEmployee) throw new HttpException(409, `Your email ${EmployeeData.company_email} already exists`);

    const hashedPassword = await bcrypt.hash(EmployeeData.password, 10);

    const createEmployeeData: Employee = await this.Employees.create({ ...EmployeeData, password: hashedPassword });
    const findUser: Employee = await this.Employees.findOne({ company_email: EmployeeData.company_email }).populate("default_shift department designation role salaryStructure_id branch");

    const token = this.createToken(createEmployeeData);
    return {findUser,token};
  }

  public async login(EmployeeData: EmployeeLoginDto): Promise<{ token: any; findUser: Employee }> {
    if (isEmpty(EmployeeData)) throw new HttpException(400, "You're not EmployeeData");

    const findUser: Employee = await this.Employees.findOne({ company_email: EmployeeData.company_email }).populate("default_shift department designation role salaryStructure_id branch");
    if (!findUser) throw new HttpException(409, `You're email ${EmployeeData.company_email} not found`);

    const isPasswordMatching: boolean = await compare(EmployeeData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const token = this.createToken(findUser);

    return { token, findUser };
  }

  public async logout(EmployeeData: EmployeeLoginDto): Promise<Employee> {
    if (isEmpty(EmployeeData)) throw new HttpException(400, "You're not EmployeeData");

    const findEmployee: Employee = await this.Employees.findOne({ company_email: EmployeeData.company_email });

    if (!findEmployee) throw new HttpException(409, `Ogid ${EmployeeData.company_email} not found`);

    return findEmployee;
  }
  public createToken(Employee: Employee): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: Employee._id };

    const secretKey: string = config.get('secretKey');
    const expiresIn: number = 60 * 60;
    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
