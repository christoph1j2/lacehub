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
import { Roles } from '../common/decorators/roles.decorator';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @Roles('admin')
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @UseGuards(VerifiedUserGuard)
    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @UseGuards(VerifiedUserGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(+id);
    }

    @UseGuards(VerifiedUserGuard)
    @Roles('admin')
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(+id, updateProductDto);
    }

    @UseGuards(VerifiedUserGuard)
    @Roles('admin')
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(+id);
    }
}
