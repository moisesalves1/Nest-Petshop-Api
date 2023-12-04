import { Controller, Post, Put, Param, Body, UseInterceptors, HttpException, HttpStatus } from "@nestjs/common";

import { ValidatorInterceptor } from "src/interceptor/validator.interceptor";

import { Pet } from "src/modules/backoffice/models/pet.model";
import { Result } from "src/modules/backoffice/models/result.model";

import { CreatePetContract } from "src/modules/backoffice/contracts/customer/create-pet.contract";
import { PetService } from "../services/pet.service";

@Controller('v1/pets')
export class PetController {

    constructor(private readonly service: PetService) {

    }

    @Post(':document')
    @UseInterceptors(new ValidatorInterceptor(new CreatePetContract()))
    async createPet(@Param('document') document, @Body() model: Pet){
        try {
            await this.service.create(document, model);
            return new Result(null, true, model, null);
        } catch (error) {
            throw new HttpException(new Result('Não foi possível criar seu pet', false, null, error), HttpStatus.BAD_REQUEST)
        }
    }

    @Put(':document/:id')
    @UseInterceptors(new ValidatorInterceptor(new CreatePetContract()))
    async updatePet(@Param('document') document, @Param('id') id, @Body() model: Pet) {
        try {
            await this.service.update(document, id, model);
            return new Result(null, true, model, null);
        } catch (error) {
            throw new HttpException(new Result('Não foi possível atualizar seu pet', false, null, error), HttpStatus.BAD_REQUEST)
        }
    }

}