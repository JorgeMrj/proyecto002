import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Producto {
  nombre: string;
  precio: number;
  emoji: string;
}

interface LineaTicket {
  nombre: string;
  precio: number;
  cantidad: number;
  total: number;
  emoji: string;
}

@Component({
  selector: 'app-panaderia',
  imports: [CommonModule, FormsModule],
  templateUrl: './panaderia.html',
  styleUrl: './panaderia.css',
  encapsulation: ViewEncapsulation.None,
})
export class Panaderia implements OnInit {
  productos: Producto[] = [
    { nombre: 'Chapata', precio: 0.65, emoji: '🥖' },
    { nombre: 'Baguette', precio: 0.55, emoji: '🥖' },
    { nombre: 'Pistola', precio: 0.45, emoji: '🍞' },
    { nombre: 'Pan Integral', precio: 0.8, emoji: '🍞' },
    { nombre: 'Croissant', precio: 1.2, emoji: '🥐' },
    { nombre: 'Magdalena', precio: 0.9, emoji: '🧁' },
  ];

  productoSeleccionadoIndex: string = '';
  cantidadSeleccionada: number = 1;
  precioActual: number = 0;
  subtotalActual: number = 0;

  ticket: Map<string, LineaTicket> = new Map();
  totalTicket: number = 0;

  private readonly STORAGE_KEY = 'panaderia_ticket';

  ngOnInit(): void {
    this.cargarTicketDesdeLocalStorage();
  }

  get lineasTicket(): LineaTicket[] {
    return Array.from(this.ticket.values());
  }

  actualizarPrecio(): void {
    if (this.productoSeleccionadoIndex !== '') {
      const producto = this.productos[parseInt(this.productoSeleccionadoIndex)];
      this.precioActual = producto.precio;
      this.cantidadSeleccionada = 1;
      this.calcularSubtotal();
    } else {
      this.precioActual = 0;
      this.subtotalActual = 0;
    }
  }

  calcularSubtotal(): void {
    const cantidad = this.cantidadSeleccionada || 0;
    if (this.productoSeleccionadoIndex !== '' && cantidad > 0) {
      this.subtotalActual = this.precioActual * cantidad;
    } else {
      this.subtotalActual = 0;
    }
  }

  cambiarCantidad(incremento: number): void {
    this.cantidadSeleccionada += incremento;
    if (this.cantidadSeleccionada < 1) {
      this.cantidadSeleccionada = 1;
    }
    this.calcularSubtotal();
  }

  agregarLinea(): void {
    if (this.productoSeleccionadoIndex === '') {
      return;
    }

    if (!this.cantidadSeleccionada || this.cantidadSeleccionada <= 0) {
      return;
    }

    const indiceProducto = parseInt(this.productoSeleccionadoIndex);
    const producto = this.productos[indiceProducto];
    const nombreProducto = producto.nombre;

    if (this.ticket.has(nombreProducto)) {
      const lineaExistente = this.ticket.get(nombreProducto)!;
      lineaExistente.cantidad += this.cantidadSeleccionada;
      lineaExistente.total = lineaExistente.precio * lineaExistente.cantidad;
      this.ticket.set(nombreProducto, lineaExistente);
    } else {
      const nuevaLinea: LineaTicket = {
        nombre: nombreProducto,
        precio: producto.precio,
        cantidad: this.cantidadSeleccionada,
        total: producto.precio * this.cantidadSeleccionada,
        emoji: producto.emoji,
      };
      this.ticket.set(nombreProducto, nuevaLinea);
    }

    this.calcularTotal();

    this.limpiarFormulario();
  }

  modificarCantidad(nombreProducto: string, incremento: number): void {
    if (this.ticket.has(nombreProducto)) {
      const linea = this.ticket.get(nombreProducto)!;
      linea.cantidad += incremento;

      if (linea.cantidad <= 0) {
        this.borrarLinea(nombreProducto);
      } else {
        linea.total = linea.precio * linea.cantidad;
        this.ticket.set(nombreProducto, linea);
        this.calcularTotal();
      }
    }
  }

  borrarLinea(nombreProducto: string): void {
    this.ticket.delete(nombreProducto);
    this.calcularTotal();
  }

  limpiarTicket(): void {
    if (this.ticket.size === 0) {
      return;
    }

    if (confirm('¿Estás seguro de que quieres limpiar todo el ticket?')) {
      this.ticket.clear();
      this.calcularTotal();
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private calcularTotal(): void {
    this.totalTicket = 0;
    this.ticket.forEach((linea) => {
      this.totalTicket += linea.total;
    });
    this.guardarTicketEnLocalStorage();
  }

  private limpiarFormulario(): void {
    this.productoSeleccionadoIndex = '';
    this.precioActual = 0;
    this.cantidadSeleccionada = 1;
    this.subtotalActual = 0;
  }

  imprimirTicket(): void {
    if (this.ticket.size === 0) {
      return;
    }

    let contenidoTicket = `
═══════════════════════════════════════
      PANADERÍA EL SÉSAMO S.A
═══════════════════════════════════════
C/Del trigo Nº24, 28916 Madrid
Teléfono: 91 694 55 66

Fecha: ${new Date().toLocaleDateString('es-ES')}
Hora: ${new Date().toLocaleTimeString('es-ES')}

═══════════════════════════════════════
               TICKET DE COMPRA
═══════════════════════════════════════

`;

    this.ticket.forEach((linea, nombreProducto) => {
      contenidoTicket += `${linea.emoji} ${nombreProducto.padEnd(15)} ${linea.cantidad
        .toString()
        .padStart(3)} x ${linea.precio.toFixed(2).padStart(6)}€ = ${linea.total
        .toFixed(2)
        .padStart(8)}€\n`;
    });

    contenidoTicket += `
═══════════════════════════════════════
SUBTOTAL: ${this.totalTicket.toFixed(2).padStart(26)}€
TOTAL: ${this.totalTicket.toFixed(2).padStart(29)}€
═══════════════════════════════════════

¡Gracias por su compra!
Vuelva pronto a visitarnos

═══════════════════════════════════════
    `;

    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket - Panadería El Sésamo</title>
            <style>
                body { 
                    font-family: 'Courier New', monospace; 
                    padding: 20px; 
                    margin: 0;
                    background: white;
                }
                .ticket {
                    max-width: 400px;
                    margin: 0 auto;
                    border: 2px solid #333;
                    padding: 20px;
                }
                pre { 
                    font-size: 12px; 
                    line-height: 1.4; 
                    margin: 0;
                    white-space: pre-wrap;
                }
                @media print {
                    body { padding: 0; }
                    .ticket { border: none; }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <pre>${contenidoTicket}</pre>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
      `);
      ventanaImpresion.document.close();
    }
  }

  private guardarTicketEnLocalStorage(): void {
    try {
      const ticketArray = Array.from(this.ticket.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ticketArray));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  private cargarTicketDesdeLocalStorage(): void {
    try {
      const ticketGuardado = localStorage.getItem(this.STORAGE_KEY);
      if (ticketGuardado) {
        const ticketArray = JSON.parse(ticketGuardado);
        this.ticket = new Map(ticketArray);
        this.calcularTotalSinGuardar();
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
      this.ticket = new Map();
    }
  }

  private calcularTotalSinGuardar(): void {
    this.totalTicket = 0;
    this.ticket.forEach((linea) => {
      this.totalTicket += linea.total;
    });
  }
}
