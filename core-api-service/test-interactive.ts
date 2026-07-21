import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const options = ['Zakat', 'Haji', 'Info'];
const msg = generateWAMessageFromContent('123@s.whatsapp.net', {
  interactiveMessage: proto.Message.InteractiveMessage.create({
    body: proto.Message.InteractiveMessage.Body.create({
      text: "Halo Sahabat Kemenag Cirebon!"
    }),
    footer: proto.Message.InteractiveMessage.Footer.create({
      text: "Silakan pilih menu"
    }),
    header: proto.Message.InteractiveMessage.Header.create({
      title: "Menu Utama",
      subtitle: "Kemenag",
      hasMediaAttachment: false
    }),
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
      buttons: [
        {
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "Pilih Menu",
            sections: [
              {
                title: "Pilihan Menu",
                rows: options.map((opt, i) => ({
                  header: "",
                  title: opt,
                  description: "",
                  id: opt
                }))
              }
            ]
          })
        }
      ]
    })
  })
}, { userJid: '123@s.whatsapp.net' });
console.log(JSON.stringify(msg.message, null, 2));
