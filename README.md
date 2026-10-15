Clean Architecture Corma MES

identificar el núcleo

Regla 1: Contacto de cliente requerido
No se puede guardar una WorkOrder si no tiene al menos un teléfono o un correo electrónico.
Por qué es una regla del negocio y no de infraestructura?: Porque en la operación real del taller es indispensable tener un medio para notificar al cliente cuando sus piezas están listas o si surge una duda con el plano
Entidad involucrada: WorkOrder
Atributos principales: id, partName, customerPhone, customerEmail, createdAt

Regla 2: Tolerancias lógicas
La dimensión mínima permitida en un parámetro de calidad nunca puede ser mayor que la dimensión máxima.
Por qué es una regla del negocio y no de infraestructura?: Es una restricción física, es imposible fabricar y medir una pieza donde el límite inferior supere al límite superior. Esta validación protege la coherencia sin importar donde  se guarde
Entidad involucrada: QualityParameter
atributos principales: id, parameterName, minDimension, maxDimension, unit

Regla 3 : Identificador de herramienta
Regla: Todo inserto o cortador debe tener un ID único.
Por qué es una regla del negocio y no de infraestructura?: cada cortador o inserto requiere un código único para rastrear su desgaste real y evitar montar una herramienta incorrecta en el CNC que arruine la pieza
Entidad involucrada: CuttingTool
Atributos principales: toolId, toolType, diameter, lifePercentage

diseño por capas

Diseño de la Regla 1: Contacto de cliente requerido

Entity WorkOrder: En su constructor valida que customerPhone y customerEmail no estén vacíos al mismo tiempo (if (!phone?.trim() && !email?.trim())). Si ambos faltan, lanza un error de negocio Use Case (CreateWorkOrderUseCase): Entrada: CreateWorkOrderDTO (partName, customerPhone, customerEmail). Salida: Promise<WorkOrder> (La orden creada con su ID asignado). Pasos: 1. Recibir el DTO desde la capa exterior -> 2. Generar un identificador y crear la instancia de la entidad WorkOrder(disparando las validaciones del dominio) -> 3. Llamar aworkOrderRepository.save(order) -> 4. Retornar la entidad creada

Interfaz del Repository: IWorkOrderRepository con el método save(order: WorkOrder): Promise<void> y getAll(): Promise<WorkOrder[]>

Adapter: InMemoryWorkOrderRepository (Arreglo en memoria para pruebas), JsonFileWorkOrderRepository (Archivo .json / LocalStorage), o FirestoreWorkOrderRepository (Nube)

Diseño de la Regla 2: Tolerancias lógicas

Entity (QualityParameter): En su constructor verifica if (minDimension > maxDimension) y lanza un error de dominio si se incumple

Use Case (DefineQualityParameterUseCase):

Entrada: QualityParameterDTO (parameterName, minDimension, maxDimension)

Salida: Promise<void>

Pasos: Recibir DTO -> 2. Instanciar QualityParameter (validando la regla física) -> 3. Persistir mediante la interfaz del repositorio

Interfaz del Repository: IQualityParameterRepository con el método save(param: QualityParameter): Promise<void>

Adapter: ApiQualityParameterRepository (Petición HTTP POST a un backend) o InMemoryQualityRepository

Diseño de la Regla 3: Identificador de herramienta

Entity (CuttingTool): Valida en su constructor que toolId tenga un formato válido no vacío y que su porcentaje de vida esté entre 0 y 100

Use Case (RegisterCuttingToolUseCase):

Entrada: RegisterToolDTO (toolId, toolType, diameter)

Salida: Promise<void>

Pasos: Recibir DTO -> 2. Consultar toolRepository.existsById(dto.toolId) para garantizar que el ID no esté duplicado -> 3. Si no existe, instanciar CuttingTool -> 4. Guardar en toolRepository.save(tool)

Interfaz del Repository: ICuttingToolRepository con los métodos existsById(toolId: string): Promise<boolean> y save(tool: CuttingTool): Promise<void>

Adapter: SqliteCuttingToolRepository or InMemoryCuttingToolRepository


¿Qué parte de tu proyecto te costó más ubicar en una capa?
Me costó trabajo ubicar la regla 3. Al principio pensaba que todo iba en la entidad CuttingTool, pero me di cuenta de que una entidad por sí sola no puede saber qué otras herramientas existen guardadas en la base de datos sin acoplarse a ella. Entendí que la validación se divide: la entidad valida que el ID no esté vacío, y el caso de uso le pregunta a la interfaz ICuttingToolRepository si el ID ya está registrado antes de crear la herramienta.

¿Qué ganas con poder cambiar la infraestructura sin tocar el núcleo?
Gano velocidad de desarrollo, facilidad de pruebas y adaptabilidad tecnológica. Para una aplicación web como Corma MES, puedo programar y probar todas las reglas del taller en milisegundos usando adaptadores en memoria, prototipar guardando en un archivo JSON o localStorage, y finalmente pasar a producción en la nube  sin tocar ni una sola línea de código de mis reglas de maquinado ni correr el riesgo de romper la lógica del negocio.

```mermaid
graph TD
    subgraph Infrastructure [Capa de Infraestructura]
        UI[React Components]
        MemRepo[InMemoryWorkOrderRepository]
        JsonRepo[JsonFileWorkOrderRepository]
    end

    subgraph Application [Capa de Aplicación]
        UC[CreateWorkOrderUseCase]
        IRepo[IWorkOrderRepository Interface]
    end

    subgraph Domain [Capa de Dominio]
        Entity[WorkOrder Entity]
    end

    UI -->|Inyecta| UC
    MemRepo -.->|Implementa| IRepo
    JsonRepo -.->|Implementa| IRepo
    UC -->|Usa| IRepo
    UC -->|Instancia| Entity
    IRepo -->|Conoce| Entity

    style Entity fill:#10b981,color:#fff
    style UC fill:#3b82f6,color:#fff
    style IRepo fill:#3b82f6,color:#fff
    style UI fill:#f59e0b,color:#fff
    style MemRepo fill:#f59e0b,color:#fff
    style JsonRepo fill:#f59e0b,color:#fff