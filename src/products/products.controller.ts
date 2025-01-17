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
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new product, only admin' })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @UseGuards(VerifiedUserGuard)
    @Get()
    @ApiBearerAuth()
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
    @ApiBearerAuth()
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a product by id, only admin' })
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a product by id, only admin' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(+id);
    }

    @UseGuards(VerifiedUserGuard)
    @Get('search')
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Search for products by name/sku/description (will be used for inventory/wtb/wts lists)',
    })
    @ApiResponse({
        status: 200,
        description: 'Products retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Products not found' })
    async searchProducts(
        @Query('query') query: string,
        @Query('limit') limit = 10,
        @Query('offset') offset = 0,
    ): Promise<{ name: string; sku: string }[]> {
        const products = await this.productsService.searchProducts(
            query,
            limit,
            offset,
        );
        return products.map((product) => ({
            name: product.name,
            sku: product.sku,
        }));
    }
}
