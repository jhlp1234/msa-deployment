import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}

  async createSamples(){
    const data = [{name: '사과', price: 1000, description: '맛있는 사과', stock: 2}, {name: '메론', price: 2000, description: '머스크 메론', stock: 1}];

    await this.productRepository.save(data);

    return true;
  }

  async getProductsInfo(productIds: string[]){
    const products = await this.productRepository.find({where: {id: In(productIds)}});

    return products;
  }
}
