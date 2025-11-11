const PDFDocument = require('pdfkit');

class PDFService {
  /**
   * Genera un comprobante de venta en PDF
   * @param {Object} sale - Objeto de venta con items, customer, seller
   * @returns {Promise<Buffer>} - Buffer del PDF generado
   */
  async generateSaleReceipt(sale) {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[PDF] Generando comprobante PDF para venta: ${sale.id}`);

        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        // Buffer para almacenar el PDF en memoria
        const chunks = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          console.log(`[PDF] ✅ PDF generado exitosamente, tamaño: ${buffer.length} bytes`);
          resolve(buffer);
        });
        doc.on('error', (err) => {
          console.error(`[PDF] ❌ Error generando PDF: ${err.message}`);
          reject(err);
        });

        // ======================
        // ENCABEZADO
        // ======================
        
        // Logo o nombre de la empresa
        doc
          .fontSize(24)
          .fillColor('#EA580C')
          .text('GESTOR DE STOCK', 50, 50, { align: 'center' })
          .fontSize(10)
          .fillColor('#6B7280')
          .text('Sistema de Gestión Integral', { align: 'center' })
          .moveDown();

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .strokeColor('#E5E7EB')
          .stroke()
          .moveDown();

        // ======================
        // INFORMACIÓN DE LA VENTA
        // ======================
        
        const infoY = doc.y;
        
        // Columna izquierda
        doc
          .fontSize(12)
          .fillColor('#111827')
          .font('Helvetica-Bold')
          .text('COMPROBANTE DE VENTA', 50, infoY)
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#6B7280')
          .moveDown(0.5)
          .text(`N° de Venta: ${sale.sale_number || sale.id}`, 50)
          .text(`Fecha: ${new Date(sale.createdAt).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`)
          .text(`Estado: ${this.getStatusLabel(sale.status)}`)
          .moveDown();

        // Columna derecha - Información del cliente
        doc
          .fontSize(10)
          .fillColor('#111827')
          .font('Helvetica-Bold')
          .text('CLIENTE', 320, infoY)
          .font('Helvetica')
          .fillColor('#6B7280')
          .moveDown(0.5)
          .text(`Nombre: ${sale.customer_name || 'N/A'}`, 320)
          .text(`DNI: ${sale.customer_dni || 'N/A'}`, 320);

        // Si hay información del customer relacionado
        if (sale.customer) {
          doc
            .text(`Email: ${sale.customer.email || 'N/A'}`, 320)
            .text(`Teléfono: ${sale.customer.phone || 'N/A'}`, 320);
        }
        
        doc.moveDown();

        // Información del vendedor
        if (sale.seller) {
          doc
            .font('Helvetica-Bold')
            .fillColor('#111827')
            .text('VENDEDOR', 320)
            .font('Helvetica')
            .fillColor('#6B7280')
            .moveDown(0.5)
            .text(`${sale.seller.name || sale.seller.email}`, 320)
            .moveDown();
        }

        doc.moveDown(2);

        // ======================
        // TABLA DE PRODUCTOS
        // ======================

        // Encabezado de tabla
        const tableTop = doc.y;
        const itemX = 50;
        const descriptionX = 180;
        const quantityX = 350;
        const priceX = 410;
        const totalX = 480;

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#FFFFFF')
          .rect(50, tableTop, 495, 25)
          .fillAndStroke('#EA580C', '#EA580C');

        doc
          .fillColor('#FFFFFF')
          .text('CÓDIGO', itemX + 5, tableTop + 8)
          .text('DESCRIPCIÓN', descriptionX, tableTop + 8)
          .text('CANT.', quantityX, tableTop + 8)
          .text('PRECIO', priceX, tableTop + 8)
          .text('SUBTOTAL', totalX, tableTop + 8);

        // Línea después del encabezado
        let currentY = tableTop + 25;
        doc
          .moveTo(50, currentY)
          .lineTo(545, currentY)
          .strokeColor('#E5E7EB')
          .stroke();

        // Items de la venta
        doc.font('Helvetica').fillColor('#374151');

        if (sale.items && sale.items.length > 0) {
          sale.items.forEach((item, index) => {
            currentY += 15;

            // Alternar color de fondo para filas
            if (index % 2 === 0) {
              doc
                .rect(50, currentY - 5, 495, 20)
                .fillColor('#F9FAFB')
                .fill();
            }

            const subtotal = item.total_price || (item.quantity * item.unit_price);

            doc
              .fillColor('#374151')
              .fontSize(9)
              .text(
                item.product?.sku || 'N/A',
                itemX + 5,
                currentY,
                { width: 120, ellipsis: true }
              )
              .text(
                item.product?.name || 'Producto',
                descriptionX,
                currentY,
                { width: 160, ellipsis: true }
              )
              .text(
                item.quantity.toString(),
                quantityX,
                currentY,
                { width: 50, align: 'center' }
              )
              .text(
                `$${this.formatPrice(item.unit_price)}`,
                priceX,
                currentY,
                { width: 60, align: 'right' }
              )
              .text(
                `$${this.formatPrice(subtotal)}`,
                totalX,
                currentY,
                { width: 60, align: 'right' }
              );

            currentY += 5;
            doc
              .moveTo(50, currentY)
              .lineTo(545, currentY)
              .strokeColor('#E5E7EB')
              .stroke();
          });
        } else {
          currentY += 15;
          doc
            .fillColor('#9CA3AF')
            .text('No hay items en esta venta', 50, currentY, { align: 'center' });
          currentY += 20;
        }

        // ======================
        // TOTALES
        // ======================

        currentY += 20;

        // Fondo para totales
        doc
          .rect(350, currentY - 10, 195, 80)
          .fillColor('#F9FAFB')
          .fill();

        doc
          .fontSize(10)
          .fillColor('#6B7280')
          .font('Helvetica')
          .text('Subtotal:', 360, currentY)
          .text(`$${this.formatPrice(sale.total_amount)}`, 480, currentY, { 
            width: 60, 
            align: 'right' 
          });

        currentY += 20;
        doc
          .text('Descuento:', 360, currentY)
          .text('$0.00', 480, currentY, { width: 60, align: 'right' });

        currentY += 5;
        doc
          .moveTo(360, currentY)
          .lineTo(540, currentY)
          .strokeColor('#E5E7EB')
          .stroke();

        currentY += 15;
        doc
          .fontSize(14)
          .fillColor('#111827')
          .font('Helvetica-Bold')
          .text('TOTAL:', 360, currentY)
          .fontSize(16)
          .fillColor('#EA580C')
          .text(`$${this.formatPrice(sale.total_amount)}`, 480, currentY, { 
            width: 60, 
            align: 'right' 
          });

        // ======================
        // MÉTODO DE PAGO
        // ======================

        currentY += 40;
        doc
          .fontSize(10)
          .fillColor('#111827')
          .font('Helvetica-Bold')
          .text('MÉTODO DE PAGO:', 50, currentY)
          .font('Helvetica')
          .fillColor('#6B7280')
          .text(this.getPaymentMethodLabel(sale.payment_method), 170, currentY);

        // ======================
        // NOTAS
        // ======================

        if (sale.notes) {
          currentY += 30;
          doc
            .fontSize(10)
            .fillColor('#111827')
            .font('Helvetica-Bold')
            .text('NOTAS:', 50, currentY)
            .moveDown(0.5)
            .font('Helvetica')
            .fillColor('#6B7280')
            .fontSize(9)
            .text(sale.notes, 50, doc.y, { 
              width: 495, 
              align: 'justify' 
            });
        }

        // ======================
        // PIE DE PÁGINA
        // ======================

        doc
          .fontSize(8)
          .fillColor('#9CA3AF')
          .text(
            'Este documento es un comprobante de venta generado electrónicamente.',
            50,
            doc.page.height - 100,
            { align: 'center', width: 495 }
          )
          .text(
            `Generado el ${new Date().toLocaleString('es-AR')}`,
            50,
            doc.page.height - 85,
            { align: 'center', width: 495 }
          )
          .text(
            '© Gestor de Stock - Sistema de Gestión Integral',
            50,
            doc.page.height - 70,
            { align: 'center', width: 495 }
          );

        // Finalizar el documento
        doc.end();

      } catch (error) {
        console.error(`[PDF] ❌ Error en generateSaleReceipt: ${error.message}`, error);
        reject(error);
      }
    });
  }

  /**
   * Formatea un precio para visualización
   */
  formatPrice(price) {
    return parseFloat(price || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Obtiene la etiqueta del estado de venta
   */
  getStatusLabel(status) {
    const labels = {
      'completed': 'COMPLETADA',
      'pending': 'PENDIENTE',
      'cancelled': 'CANCELADA'
    };
    return labels[status] || status?.toUpperCase() || 'N/A';
  }

  /**
   * Obtiene la etiqueta del método de pago
   */
  getPaymentMethodLabel(method) {
    const labels = {
      'cash': 'Efectivo',
      'efectivo': 'Efectivo',
      'card': 'Tarjeta',
      'tarjeta': 'Tarjeta',
      'transfer': 'Transferencia',
      'transferencia': 'Transferencia',
      'mercadopago': 'Mercado Pago'
    };
    return labels[method?.toLowerCase()] || method || 'N/A';
  }
}

module.exports = new PDFService();
