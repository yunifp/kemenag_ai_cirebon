const fs = require('fs');
const pdf = require('pdf-parse');

async function main() {
  console.log('Keys:', Object.keys(pdf));
  const buffer = fs.readFileSync('docs/prd_chatbot_kemenag.md'); // Just a test, actually we need a real PDF
  // let's just see if pdf is a function
  console.log('pdf is function?', typeof pdf === 'function');
  if (pdf.PDFParse) {
      console.log('Has PDFParse class');
  }
}
main();
