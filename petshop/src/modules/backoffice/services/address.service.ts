import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Customer } from "src/modules/backoffice/models/customer.model";
import { Address } from "src/modules/backoffice/models/address.model";
import { AddressType } from "src/modules/backoffice/enums/address-type.enum";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class AddressService {
    
    constructor(@InjectModel('Customer') private readonly model: Model<Customer>,
    private readonly httpService: HttpService) {
        
    }

    async create(document: string, data: Address, type: AddressType): Promise<Customer> {
        const options = { upsert: true };

        if (type == AddressType.Billing){
            return await this.model.findOneAndUpdate({ document }, {
                $set: {
                    billingAddress: data,
                }
            },
            options)
        } else {
            return await this.model.findOneAndUpdate({ document }, {
                $set: {
                    shippingAddress: data,
                }
            },
            options)
        }

        
    }

    getAddressByZipCode(zipcode: string) {
        const url = `https://viacep.com.br/ws/${zipcode}/json/`;
        return this.httpService.get(url);
    }

    
}