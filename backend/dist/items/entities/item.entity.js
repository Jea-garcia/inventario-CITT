"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = exports.ItemStatus = void 0;
const typeorm_1 = require("typeorm");
var ItemStatus;
(function (ItemStatus) {
    ItemStatus["DISPONIBLE"] = "DISPONIBLE";
    ItemStatus["PRESTADO"] = "PRESTADO";
    ItemStatus["MANTENIMIENTO"] = "MANTENIMIENTO";
    ItemStatus["DEBAJA"] = "DEBAJA";
})(ItemStatus || (exports.ItemStatus = ItemStatus = {}));
let Item = class Item {
    id;
    nombre;
    codigoSerie;
    categoria;
    estado;
    descripcion;
    ubicacion;
    fechaCreacion;
    fechaActualizacion;
};
exports.Item = Item;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Item.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Item.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], Item.prototype, "codigoSerie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Item.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ItemStatus, default: ItemStatus.DISPONIBLE }),
    __metadata("design:type", String)
], Item.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Item.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Item.prototype, "fechaActualizacion", void 0);
exports.Item = Item = __decorate([
    (0, typeorm_1.Entity)('items')
], Item);
//# sourceMappingURL=item.entity.js.map