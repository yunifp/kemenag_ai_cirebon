import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
const options = ['Zakat', 'Haji', 'Info'];
const msg = generateWAMessageFromContent('1234@s.whatsapp.net', {
  listMessage: {
    title: "Menu Utama",
    description: "Silakan pilih menu",
    buttonText: "Pilih Menu",
    listType: 1,
    sections: [
      {
        title: "Pilihan",
        rows: options.map(opt => ({ title: opt, rowId: opt }))
      }
    ]
  }
}, { userJid: '1234@s.whatsapp.net' });
console.log(JSON.stringify(msg.message, null, 2));
