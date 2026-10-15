import { WorkOrder } from "../domain/WorkOrder";
import { IWorkOrderRepository } from "./IWorkOrderRepository";

export interface CreateWorkOrderDTO {
  partName: string;
  customerPhone?: string;
  customerEmail?: string;
}

export class CreateWorkOrderUseCase {
  // Inyección de dependencias: depende de la interfaz, NUNCA de la base de datos directa
  constructor(private readonly repository: IWorkOrderRepository) {}

  async execute(dto: CreateWorkOrderDTO): Promise<WorkOrder> {
    const generatedId = `WO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Se instancia la Entidad (Aquí se dispara la validación de la regla de negocio)
    const newWorkOrder = new WorkOrder(
      generatedId,
      dto.partName,
      dto.customerPhone,
      dto.customerEmail
    );

    // 2. Si no lanzó error, se guarda usando el contrato del repositorio
    await this.repository.save(newWorkOrder);

    return newWorkOrder;
  }
}