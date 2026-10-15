import { WorkOrder } from "../domain/WorkOrder";

export interface IWorkOrderRepository {
  save(workOrder: WorkOrder): Promise<void>;
  getAll(): Promise<WorkOrder[]>;
}