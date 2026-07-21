import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

// Try creating an interactive list message
const msg = generateWAMessageFromContent('123456@s.whatsapp.net', {
  viewOnceMessage: {
    message: {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2
      },
      interactiveMessage: {
        body: { text: "Menu\nSilakan memilih menu yang tersedia.. 😊" },
        footer: { text: "Klik untuk memilih menu" },
        header: { title: "", subtitle: "", hasMediaAttachment: false },
        nativeFlowMessage: {
          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Pilih Menu",
                sections: [
                  {
                    title: "Menu Utama",
                    rows: [
                      { title: "Surat Menyurat", description: "Pengiriman surat untuk perizinan dll", id: "menu_surat" },
                      { title: "Informasi/Layanan Zakat", id: "menu_zakat" },
                    ]
                  }
                ]
              })
            }
          ]
        }
      }
    }
  }
}, { userJid: 'me@s.whatsapp.net' });

console.log(JSON.stringify(msg, null, 2));
