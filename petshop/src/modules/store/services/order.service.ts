import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "../entities/order.entity";
import { Equal, Repository } from "typeorm";

@Injectable()
export class OrderService {

    constructor(
        @InjectRepository(Order)
        private readonly repository: Repository<Order>
    ) { }

    async getByNumber(number: string): Promise<Order> {
        return await this.repository.findOneBy({ number: Equal(number) })
    }

    async getByCustomer(customer: string): Promise<Order[]> {
        return await this.repository.findBy({ customer: Equal(customer) })
    }

    async post(order: Order) {
        await this.repository.save(order);
    }
}