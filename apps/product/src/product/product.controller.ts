import { Controller, Get, Post, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetProductsInfo } from './dto/get-products-info.dto';
import { RpcInterceptor } from '@app/common/interceptor/rpc.interceptor';
import { ProductMicroservice } from '@app/common';
import { GrpcInterceptor } from '@app/common/grpc/interceptor/grpc.interceptor';

@Controller('product')
@UseInterceptors(GrpcInterceptor)
@ProductMicroservice.ProductServiceControllerMethods()
export class ProductController implements ProductMicroservice.ProductServiceController {
  constructor(private readonly productService: ProductService) {}

  // @MessagePattern({cmd: 'create_samples'})
  // @UseInterceptors(RpcInterceptor)
  async createSamples(){
    const resp = await this.productService.createSamples();

    return {success: resp};
  }

  // @MessagePattern({cmd: 'get_products_info'})
  // @UsePipes(ValidationPipe)
  // @UseInterceptors(RpcInterceptor)
  async getProductsInfo(request: ProductMicroservice.GetProductsInfoRequest){
    const resp = await this.productService.getProductsInfo(request.productIds);

    return {products: resp};
  }
}
