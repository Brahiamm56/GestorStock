const PDFDocument = require('pdfkit');

// Test PDF generation
function testPDFGeneration() {
  console.log('🧪 Testing PDF generation...');
  
  try {
    // Create document in memory
    const doc = new PDFDocument();
    const chunks = [];
    
    // Capture chunks
    doc.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    // Test content
    doc.fontSize(20).text('TEST PDF', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('This is a test PDF document');
    doc.text('Generated at: ' + new Date().toLocaleString('es-ES'));
    
    // End document
    doc.end();
    
    // Wait for completion
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      console.log('✅ PDF generated successfully!');
      console.log('📊 Buffer size:', pdfBuffer.length, 'bytes');
      console.log('📄 First few bytes:', pdfBuffer.slice(0, 20).toString('hex'));
      
      if (pdfBuffer.length > 100) {
        console.log('🎉 PDF generation is working correctly!');
      } else {
        console.log('❌ PDF seems too small, there might be an issue');
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing PDF generation:', error);
  }
}

// Run test
testPDFGeneration();




