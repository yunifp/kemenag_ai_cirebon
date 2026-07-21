import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const options = ['Zakat', 'Haji', 'Info'];
const msg = generateWAMessageFromContent('123@s.whatsapp.net', {
  listMessage: proto.Message.ListMessage.create({
    title: "Menu Utama",
    description: "Silakan pilih menu",
    buttonText: "Pilih Menu",
    listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
    sections: [
      proto.Message.ListMessage.Section.create({
        title: "Pilihan Menu",
        rows: options.map(opt => proto.Message.ListMessage.Row.create({
          title: opt,
          rowId: opt
        }))
      })
    ]
  })
}, { userJid: '123@s.whatsapp.net' });
console.log(JSON.stringify(msg.message, null, 2));
