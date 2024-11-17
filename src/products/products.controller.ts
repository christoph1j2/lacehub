import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @Roles('admin')
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(RolesGuard)
    @Roles('admin')
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(+id, updateProductDto);
    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(RolesGuard)
    @Roles('admin')
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(+id);
    }
}
