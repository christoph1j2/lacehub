import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInventory } from '../entities/userInventory.entity';
import { Repository } from 'typeorm';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';
import { UpdateUserInventoryDto } from './dto/update-userInventory.dto';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { WtbService } from '../wtb/wtb.service';
import { WtsService } from '../wts/wts.service';
import * as XLSX from 'xlsx';

/**
 * Service responsible for managing user inventory items.
 *
 * This service provides functionality to create, retrieve, update and delete
 * inventory items for users, as well as special operations like moving items
 * to the Want to Buy (WTB) or Want to Sell (WTS) listings.
 */
@Injectable()
export class UserInventoryService {
    /**
     * Creates an instance of UserInventoryService.
     *
     * @param userInventoryRepository - Repository for user inventory entity operations
     * @param userRepository - Repository for user entity operations
     * @param productRepository - Repository for product entity operations
     * @param wtbService - Service for managing Want to Buy listings
     * @param wtsService - Service for managing Want to Sell listings
     */
    constructor(
        @InjectRepository(UserInventory)
        private readonly userInventoryRepository: Repository<UserInventory>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly wtbService: WtbService,
        private readonly wtsService: WtsService,
    ) {}

    /**
     * Retrieves all inventory items across all users.
     *
     * @returns Promise resolving to an array of all user inventory items with related user and product data
     */
    async findAll(): Promise<UserInventory[]> {
        return await this.userInventoryRepository.find({
            relations: ['user', 'product'],
        });
    }

    /**
     * Retrieves all inventory items for a specific user.
     *
     * @param userId - The ID of the user whose inventory items to retrieve
     * @returns Promise resolving to an array of the user's inventory items with related product data
     */
    async findByUser(userId: number): Promise<UserInventory[]> {
        return await this.userInventoryRepository.find({
            where: { user: { id: userId } },
            relations: ['product'],
        });
    }

    /**
     * Creates a new inventory item for a user.
     * If an item with the same product and size already exists for the user,
     * the quantity is added to the existing item instead.
     *
     * @param createUserInventoryDto - Data transfer object containing inventory item details
     * @param authenthicatedUserId - ID of the authenticated user creating the inventory item
     * @returns Promise resolving to the created or updated user inventory item
     * @throws NotFoundException if the user or product is not found
     */
    async create(
        createUserInventoryDto: CreateUserInventoryDto,
        authenthicatedUserId: number,
    ): Promise<UserInventory> {
        const userId =
            /*createUserInventoryDto.userId ||*/ authenthicatedUserId;

        // fetch user
        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId}  not found`);
        }

        // fetch product
        const product = await this.productRepository.findOneBy({
            id: createUserInventoryDto.productId,
        });
        if (!product) {
            throw new NotFoundException(
                `Product with ID ${createUserInventoryDto.productId} not found`,
            );
        }

        const existingInventoryItem =
            await this.userInventoryRepository.findOne({
                where: {
                    user: { id: userId },
                    product: { id: product.id },
                    size: createUserInventoryDto.size,
                },
            });

        if (existingInventoryItem) {
            existingInventoryItem.quantity += createUserInventoryDto.quantity;
            return await this.userInventoryRepository.save(
                existingInventoryItem,
            );
        }

        const inventoryItem = this.userInventoryRepository.create({
            user,
            product,
            size: createUserInventoryDto.size,
            quantity: createUserInventoryDto.quantity,
        });

        return await this.userInventoryRepository.save(inventoryItem);
    }

    /**
     * Updates an existing inventory item.
     *
     * @param id - ID of the inventory item to update
     * @param updateUserInventoryDto - Data transfer object containing updated inventory item details
     * @param userId - ID of the authenticated user attempting to update the item
     * @returns Promise resolving to the updated user inventory item
     * @throws NotFoundException if the inventory item is not found
     * @throws ForbiddenException if the authenticated user is not the owner of the inventory item
     */
    async update(
        id: number,
        updateUserInventoryDto: UpdateUserInventoryDto,
        userId: number,
    ): Promise<UserInventory> {
        const existingInventory = await this.userInventoryRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });

        if (!existingInventory) {
            throw new NotFoundException('Inventory item not found');
        }

        if (existingInventory.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to update this inventory item',
            );
        }

        await this.userInventoryRepository.update(id, updateUserInventoryDto);

        return await this.userInventoryRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });
    }

    /**
     * Deletes an inventory item for a user.
     *
     * @param itemId - ID of the inventory item to delete
     * @param userId - ID of the authenticated user attempting to delete the item
     * @throws NotFoundException if the inventory item is not found
     * @throws ForbiddenException if the authenticated user is not the owner of the inventory item
     */
    async delete(itemId: number, userId: number): Promise<void> {
        const item = await this.userInventoryRepository.findOne({
            where: { id: itemId },
            relations: ['user'],
        });

        if (!item) {
            throw new NotFoundException('Inventory item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to delete this inventory item',
            );
        }

        await this.userInventoryRepository.delete(itemId);
    }

    /**
     * Moves an inventory item to the Want to Buy (WTB) listing.
     *
     * @param itemId - ID of the inventory item to move
     * @param userId - ID of the authenticated user attempting to move the item
     * @throws NotFoundException if the inventory item is not found
     * @throws ForbiddenException if the authenticated user is not the owner of the inventory item
     */
    async moveToWtb(itemId: number, userId: number): Promise<void> {
        const item = await this.userInventoryRepository.findOne({
            where: { id: itemId },
            relations: ['user', 'product'],
        });

        if (!item) {
            throw new NotFoundException('Inventory item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to move this inventory item',
            );
        }

        await this.wtbService.create(
            {
                productId: item.product.id,
                size: item.size,
                quantity: item.quantity,
            },
            userId,
        );

        //? await this.userInventoryRepository.delete(itemId);
    }

    /**
     * Moves an inventory item to the Want to Sell (WTS) listing.
     *
     * @param itemId - ID of the inventory item to move
     * @param userId - ID of the authenticated user attempting to move the item
     * @throws NotFoundException if the inventory item is not found
     * @throws ForbiddenException if the authenticated user is not the owner of the inventory item
     */
    async moveToWts(itemId: number, userId: number): Promise<void> {
        const item = await this.userInventoryRepository.findOne({
            where: { id: itemId },
            relations: ['user', 'product'],
        });

        if (!item) {
            throw new NotFoundException('Inventory item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to move this inventory item',
            );
        }

        await this.wtsService.create(
            {
                productId: item.product.id,
                size: item.size,
                quantity: item.quantity,
            },
            userId,
        );

        //? await this.userInventoryRepository.delete(itemId);
    }

    /**
     * Retrieves the top 10 most popular products in inventory.
     *
     * @returns Promise resolving to an array of the top 10 most popular products with their total quantities
     */
    async topProducts(): Promise<any> {
        return await this.userInventoryRepository
            .createQueryBuilder('user_inventory')
            .leftJoin('user_inventory.product', 'product')
            .select(
                'user_inventory.product_id, product.name as product_name, SUM(user_inventory.quantity) as total',
            )
            .groupBy('user_inventory.product_id, product.name')
            .orderBy('total', 'DESC')
            .limit(10)
            .getRawMany();
    }

    /**
     * Uploads and processes inventory items from an Excel file
     *
     * @param fileBuffer - Buffer containing the Excel file data
     * @param userId - ID of the user uploading inventory
     * @returns Promise resolving to an object with success and error counts and details
     */
    async upload(fileBuffer: Buffer, userId: number): Promise<any> {
        // Step 1: Parse the Excel file into a workbook object
        const workbook = XLSX.read(fileBuffer);

        // Get the first sheet from the workbook
        const sheetName = workbook.SheetNames[0];

        // Step 2: Convert sheet data to JSON
        // This transforms Excel rows into an array of JavaScript objects
        // where column headers become property names
        const data: any[] = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName],
            {
                raw: true, // Keep raw values (don't parse dates, etc.)
                defval: null, // Use null for empty cells
            },
        );

        // Log parsed data for debugging
        console.log('Excel data:', data);

        // Step 3: Validate the file has content
        if (data.length === 0) {
            throw new BadRequestException('The uploaded file is empty');
        }

        // Step 4: Verify required columns exist in the file
        const requiredColumns = ['SKU', 'Size', 'Quantity'];
        const firstRow = data[0];

        // Find any missing columns by comparing required columns with actual columns
        const missingColumns = requiredColumns.filter(
            (column) => !(column in firstRow),
        );

        // Throw error if any required columns are missing
        if (missingColumns.length > 0) {
            throw new BadRequestException(
                `Template is missing required columns: ${missingColumns.join(', ')}. Found columns: ${Object.keys(firstRow).join(', ')}`,
            );
        }

        // Arrays to track processing results
        const errors = [];
        const successes = [];

        // Step 5: Process each row in the Excel file
        for (const [index, row] of data.entries()) {
            try {
                // Validate row has all required fields
                if (
                    !row.SKU ||
                    !row.Size ||
                    row.Quantity === undefined ||
                    row.Quantity === null
                ) {
                    errors.push({
                        row: index + 2, // +2 because Excel is 1-indexed and we skip header row
                        error: 'Missing required fields (SKU, Size, or Quantity)',
                    });
                    continue; // Skip to next row
                }

                // Validate quantity is a positive integer
                const quantity = Number(row.Quantity);
                if (
                    isNaN(quantity) ||
                    quantity <= 0 ||
                    !Number.isInteger(quantity)
                ) {
                    errors.push({
                        row: index + 2,
                        sku: row.SKU,
                        size: row.Size,
                        error: 'Quantity must be a positive integer',
                    });
                    continue; // Skip to next row
                }

                // Step 6: Look up product in database by SKU
                const product = await this.productRepository.findOne({
                    where: { sku: row.SKU },
                });

                // If product not found, record error and continue
                if (!product) {
                    errors.push({
                        row: index + 2,
                        sku: row.SKU,
                        error: 'Product not found in database',
                    });
                    continue;
                }

                // Step 7: Check if user already has this product in inventory
                const existingItem = await this.userInventoryRepository.findOne(
                    {
                        where: {
                            user: { id: userId },
                            product: { id: product.id },
                            size: row.Size,
                        },
                    },
                );

                // Step 8: Update existing item or create new one
                if (existingItem) {
                    // Update quantity of existing inventory item
                    existingItem.quantity += quantity;
                    await this.userInventoryRepository.save(existingItem);

                    // Record successful update
                    successes.push({
                        row: index + 2,
                        sku: row.SKU,
                        size: row.Size,
                        quantity,
                        status: 'updated',
                        newQuantity: existingItem.quantity,
                    });
                } else {
                    // Create new inventory item
                    const newItem = this.userInventoryRepository.create({
                        user: { id: userId },
                        product: { id: product.id },
                        size: row.Size,
                        quantity,
                    });

                    await this.userInventoryRepository.save(newItem);

                    // Record successful creation
                    successes.push({
                        row: index + 2,
                        sku: row.SKU,
                        size: row.Size,
                        quantity,
                        status: 'created',
                    });
                }
            } catch (error) {
                // Log and record any errors during processing
                console.error('Error processing row:', error);
                errors.push({
                    row: index + 2,
                    sku: row.SKU,
                    size: row.Size,
                    error: `Error processing row: ${error.message}`,
                });
            }
        }

        // Step 9: Return processing summary with statistics
        return {
            totalRows: data.length,
            successCount: successes.length,
            errorCount: errors.length,
            successes,
            errors,
        };
    }
}
