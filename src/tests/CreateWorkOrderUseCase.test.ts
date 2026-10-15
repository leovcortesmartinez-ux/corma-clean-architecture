import { describe, it, expect, afterEach } from "vitest";
import * as fs from "fs/promises";
import { CreateWorkOrderUseCase } from "../application/CreateWorkOrderUseCase";
import { InMemoryWorkOrderRepository } from "../infrastructure/InMemoryWorkOrderRepository";
import { JsonFileWorkOrderRepository } from "../infrastructure/JsonFileWorkOrderRepository";

describe("CreateWorkOrderUseCase - Clean Architecture Tests", () => {
  const testJsonFile = "test-workorders.json";

  afterEach(async () => {
    // Limpiar archivo JSON de prueba si se creó
    try {
      await fs.unlink(testJsonFile);
    } catch {}
  });

  // PRUEBA 1 (Parte 3): Caso exitoso usando adaptador en memoria
  it("Debe crear y guardar una WorkOrder en memoria cuando tiene correo o teléfono", async () => {
    const inMemoryRepo = new InMemoryWorkOrderRepository();
    const useCase = new CreateWorkOrderUseCase(inMemoryRepo);

    const result = await useCase.execute({
      partName: "Flecha de Acero 4140",
      customerEmail: "compras@industrialqro.com",
    });

    const savedOrders = await inMemoryRepo.getAll();
    expect(result.id).toBeDefined();
    expect(savedOrders.length).toBe(1);
    expect(savedOrders[0].partName).toBe("Flecha de Acero 4140");
  });

  // PRUEBA 2 (Parte 3): Caso fallido cuando se rompe la regla de negocio
  it("Debe lanzar un error y NO guardar nada si faltan tanto el teléfono como el correo", async () => {
    const inMemoryRepo = new InMemoryWorkOrderRepository();
    const useCase = new CreateWorkOrderUseCase(inMemoryRepo);

    await expect(
      useCase.execute({
        partName: "Buje de Bronce",
        customerPhone: "",
        customerEmail: "   ", // Vacío
      })
    ).rejects.toThrow("REGLA DE NEGOCIO ROTA");

    const savedOrders = await inMemoryRepo.getAll();
    expect(savedOrders.length).toBe(0);
  });

  // PRUEBA 3 (Parte 4): Swap de infraestructura a archivo JSON sin tocar UseCase ni Entity
  it("SWAP DE INFRAESTRUCTURA: Debe funcionar exactamente igual al cambiar a JsonFileWorkOrderRepository", async () => {
    const jsonRepo = new JsonFileWorkOrderRepository(testJsonFile);
    // El UseCase recibe el nuevo adaptador sin cambiar ni una línea de su código
    const useCase = new CreateWorkOrderUseCase(jsonRepo);

    await useCase.execute({
      partName: "Placa Base Rectificada",
      customerPhone: "442-123-4567",
    });

    const ordersFromDisk = await jsonRepo.getAll();
    expect(ordersFromDisk.length).toBe(1);
    expect(ordersFromDisk[0].customerPhone).toBe("442-123-4567");
  });
});