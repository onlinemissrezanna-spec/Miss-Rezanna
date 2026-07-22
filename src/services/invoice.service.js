const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const invoiceDir = path.join(__dirname, '../../uploads/invoices');
if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
}

const generateInvoice = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const invoicePath = path.join(invoiceDir, `${order.invoice.invoiceNumber}.pdf`);
            const doc = new PDFDocument({ margin: 50 });

            doc.pipe(fs.createWriteStream(invoicePath));

            // Header
            doc.fontSize(20).text('MISS REZANNA', { align: 'center' });
            doc.fontSize(10).text('Premium Luxury Fashion', { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(16).text('TAX INVOICE', { align: 'center', underline: true });
            doc.moveDown();

            // Order Details
            doc.fontSize(10)
               .text(`Order Number: ${order.orderNumber}`)
               .text(`Invoice Number: ${order.invoice.invoiceNumber}`)
               .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
               .text(`Payment Status: ${order.paymentStatus}`)
               .moveDown();

            // Customer
            doc.text('Billed To:')
               .text(`${order.user.firstName} ${order.user.lastName}`)
               .text(order.shippingAddress.addressLine1)
               .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`)
               .moveDown();

            // Items Table Header
            const tableTop = 250;
            doc.font('Helvetica-Bold');
            doc.text('Item', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Price', 350, tableTop);
            doc.text('Total', 450, tableTop);
            
            doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
            doc.font('Helvetica');

            let y = tableTop + 25;
            order.items.forEach(item => {
                doc.text(item.product.name, 50, y);
                doc.text(item.quantity.toString(), 300, y);
                doc.text(parseFloat(item.unitPrice).toFixed(2), 350, y);
                doc.text(parseFloat(item.subtotal).toFixed(2), 450, y);
                y += 20;
            });

            doc.moveTo(50, y + 10).lineTo(500, y + 10).stroke();
            
            // Totals
            y += 25;
            doc.text('Subtotal:', 350, y).text(parseFloat(order.subtotal).toFixed(2), 450, y);
            y += 20;
            doc.text('Discount:', 350, y).text(`- ${parseFloat(order.discount).toFixed(2)}`, 450, y);
            y += 20;
            doc.text('Tax (GST):', 350, y).text(parseFloat(order.tax).toFixed(2), 450, y);
            y += 20;
            doc.text('Shipping:', 350, y).text(parseFloat(order.shippingCharge).toFixed(2), 450, y);
            
            y += 25;
            doc.font('Helvetica-Bold');
            doc.fontSize(12).text('Grand Total:', 320, y).text(`INR ${parseFloat(order.grandTotal).toFixed(2)}`, 420, y);

            // Footer
            doc.font('Helvetica');
            doc.fontSize(10).text('Thank you for shopping with MISS REZANNA!', 50, 700, { align: 'center', width: 500 });

            doc.end();

            // Wait a moment for stream to finish
            setTimeout(() => {
                resolve(`/uploads/invoices/${order.invoice.invoiceNumber}.pdf`);
            }, 500);

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoice };
