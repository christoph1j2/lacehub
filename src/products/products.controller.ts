import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { Product } from '../entities/product.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @UseGuards(VerifiedUserGuard)
    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({
        status: 200,
        description: 'Products retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findAll() {
        return this.productsService.findAll();
    }

    @UseGuards(VerifiedUserGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Get a product by id' })
    @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(+id);
    }

    @UseGuards(VerifiedUserGuard)
    @Roles('admin')
    @Patch(':id')
    @ApiOperation({ summary: 'Update a product by id' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(+id, updateProductDto);
    }

    @UseGuards(VerifiedUserGuard)
    @Roles('admin')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product by id' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(+id);
    }

    @UseGuards(VerifiedUserGuard)
    @Get('search')
    @ApiOperation({ summary: 'Search for products by name/sku/description' })
    @ApiResponse({
        status: 200,
        description: 'Products retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Products not found' })
    async searchProducts(@Query('query') query: string): Promise<Product[]> {
        return await this.productRepository.find({
            where: [
                { sku: Like(`%${query}%`) },
                { name: Like(`%${query}%`) },
                { description: Like(`%${query}%`) },
            ],
            take: 10,
        });
    }
}
