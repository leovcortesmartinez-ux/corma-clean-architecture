import * as fs from "fs/promises";
import * as path from "path";
import { WorkOrder } from "../domain/WorkOrder";
import { IWorkOrderRepository } from "../application/IWorkOrderRepository";

export class JsonFileWorkOrderRepository implements IWorkOrderRepository {
  private readonly filePath: string;

  constructor(fileName: string = "workorders.json") {
    this.filePath = path.join(process.cwd(), fileName);
  }

  async save(workOrder: WorkOrder): Promise<void> {
    const currentOrders = await this.getAll();
    currentOrders.push(workOrder);
    await fs.writeFile(this.filePath, JSON.stringify(currentOrders, null, 2), "utf-8");
  }

  async getAll(): Promise<WorkOrder[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as WorkOrder[];
    } catch {
      // Si el archivo aún no existe, retorna arreglo vacío
      return [];
    }
  }
}