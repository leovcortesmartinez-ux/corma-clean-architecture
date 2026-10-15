import { WorkOrder } from "../domain/WorkOrder";
import { IWorkOrderRepository } from "../application/IWorkOrderRepository";

export class InMemoryWorkOrderRepository implements IWorkOrderRepository {
  private orders: WorkOrder[] = [];

  async save(workOrder: WorkOrder): Promise<void> {
    this.orders.push(workOrder);
  }

  async getAll(): Promise<WorkOrder[]> {
    return [...this.orders];
  }
}