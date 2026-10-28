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
exports.Solicitud = exports.SolicitudState = void 0;
const typeorm_1 = require("typeorm");
const item_entity_1 = require("./item.entity");
var SolicitudState;
(function (SolicitudState) {
    SolicitudState["PENDIENTE"] = "PENDIENTE";
    SolicitudState["APROBADA"] = "APROBADA";
    SolicitudState["RECHAZADA"] = "RECHAZADA";
})(SolicitudState || (exports.SolicitudState = SolicitudState = {}));
let Solicitud = class Solicitud {
    id;
    item;
    solicitanteNombre;
    solicitanteEmail;
    estado;
    aprobadoPor;
    fechaSolicitud;
};
exports.Solicitud = Solicitud;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Solicitud.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { onDelete: 'CASCADE' }),
    __metadata("design:type", item_entity_1.Item)
], Solicitud.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Solicitud.prototype, "solicitanteNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Solicitud.prototype, "solicitanteEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SolicitudState, default: SolicitudState.PENDIENTE }),
    __metadata("design:type", String)
], Solicitud.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Solicitud.prototype, "aprobadoPor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Solicitud.prototype, "fechaSolicitud", void 0);
exports.Solicitud = Solicitud = __decorate([
    (0, typeorm_1.Entity)('solicitudes')
], Solicitud);
//# sourceMappingURL=solicitud.entity.js.map