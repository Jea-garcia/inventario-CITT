import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    create(createItemDto: CreateItemDto): Promise<import("./entities/item.entity").Item>;
    findAll(): Promise<import("./entities/item.entity").Item[]>;
    findOne(id: string): Promise<import("./entities/item.entity").Item>;
    update(id: string, updateItemDto: UpdateItemDto): Promise<import("./entities/item.entity").Item>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
