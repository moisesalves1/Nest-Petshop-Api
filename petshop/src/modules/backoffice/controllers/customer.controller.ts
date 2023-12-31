import { Controller, Get, Post, Param, Body, UseInterceptors, HttpException, HttpStatus, Put } from "@nestjs/common";
import { Md5 } from "md5-typescript";
import { ValidatorInterceptor } from "src/modules/backoffice/interceptors/validator.interceptor";

import { AccountService } from "src/modules/backoffice/services/account.service";
import { CustomerService } from "src/modules/backoffice/services/customer.service";

import { Customer } from "src/modules/backoffice/models/customer.model";
import { User } from "src/modules/backoffice/models/user.model";
import { ResultDto } from "src/modules/backoffice/dtos/result.dto";

import { QueryDto } from "src/modules/backoffice/dtos/query.dto";
import { CreateCustomerDTO } from "src/modules/backoffice/dtos/customer/create-customer.dto";

import { QueryContract } from "src/modules/backoffice/contracts/query.contract";
import { CreateCustomerContract } from "src/modules/backoffice/contracts/customer/create-customer.contract";
import { UpdateCustomerDTO } from "src/modules/backoffice/dtos/customer/update-customer.dto";
import { UpdateCustomerContract } from "src/modules/backoffice/contracts/customer/update-customer.contract";
import { CreateCreditCardContract } from "src/modules/backoffice/contracts/customer/create-credit-card.contract";
import { CreditCard } from "src/modules/backoffice/models/creditcard.model";
import { CacheInterceptor } from "@nestjs/cache-manager";

@Controller('v1/customers')
export class CustomerController {

    constructor(private readonly accountService: AccountService,
        private readonly customerService: CustomerService) {

    }

    @Post()
    @UseInterceptors(new ValidatorInterceptor(new CreateCustomerContract()))
    async post(@Body() model: CreateCustomerDTO) {
        try {
            const password = await Md5.init(`${model.password}${process.env.SALT_KEY}`)
            const user = await this.accountService.create(
                new User(model.document, password, true, ['user'])
            );
            const customer = new Customer(model.name, model.document, model.email, [], null, null, null, user);
            const  res = await this.customerService.create(customer);
            return new ResultDto('Cliente criado com sucesso!', true, res, null);
        } catch (error) {
            //Rolback manual
            throw new HttpException(new ResultDto('Não foi possível realizar seu cadastro', false, null, error), HttpStatus.BAD_REQUEST)
        }
    }

    @Get()
    @UseInterceptors(CacheInterceptor)
    async getAll() {
        const customers = await this.customerService.findAll();
        return new ResultDto(null, true, customers, null)
    }

    @Get(':document')
    async get(@Param('document') document) {
        const customer = await this.customerService.find(document);
        return new ResultDto(null, true, customer, null)
    }

    @Post('query')
    @UseInterceptors(new ValidatorInterceptor(new QueryContract()))
    async query(@Body() model: QueryDto) {
        const customers = await this.customerService.query(model);
        return new ResultDto(null, true, customers, null);
    }

    @Put(':document')
    @UseInterceptors(new ValidatorInterceptor(new UpdateCustomerContract()))
    async update(@Param('document') document, @Body() model: UpdateCustomerDTO) {
        try {
            await this.customerService.update(document, model);
            return new ResultDto(null, true, model, null);
        } catch (error) {
            throw new HttpException(new ResultDto('Não foi possível alterar seus dados', false, null, error), HttpStatus.BAD_REQUEST)
        }
    }

    @Post(':document/credit-cards')
    @UseInterceptors(new ValidatorInterceptor(new CreateCreditCardContract()))
    async createCreditCard(@Param('document') document, @Body() model: CreditCard) {
        try {
            await this.customerService.saveOrUpdateCreditCard(document, model);
            return new ResultDto(null, true, model, null);
        } catch (error) {
            throw new HttpException(new ResultDto('Não foi possível adicionar seu cartão de crédito', false, null, error), HttpStatus.BAD_REQUEST)
        }
    }
}