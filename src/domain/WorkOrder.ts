export class WorkOrder {

public readonly id: string;

public readonly partName: string;

public readonly customerPhone?: string;

public readonly customerEmail?: string;

public readonly createdAt: Date;



constructor(

id: string,

partName: string,

customerPhone?: string,

customerEmail?: string

) {

if (!partName || partName.trim() === "") {

throw new Error("El nombre de la pieza es obligatorio.");

}



// REGLA DE NEGOCIO: Contacto de cliente requerido (Teléfono O Correo)

const hasPhone = customerPhone && customerPhone.trim() !== "";

const hasEmail = customerEmail && customerEmail.trim() !== "";



if (!hasPhone && !hasEmail) {

throw new Error(

"REGLA DE NEGOCIO ROTA: No se puede guardar una WorkOrder sin al menos un teléfono o un correo electrónico de contacto."

);

}



this.id = id;

this.partName = partName.trim();

this.customerPhone = customerPhone?.trim();

this.customerEmail = customerEmail?.trim();

this.createdAt = new Date();

}

}