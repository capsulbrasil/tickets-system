const QRCode = require('qrcode');
const endpoint = `http://localhost:8900/api/CapsulTicketSystem/qrcode`;

async function fetchQRcode() {
  const response = await fetch(endpoint);
  const qrData = await response.json();
  const qrcodeData = qrData.qrcode;
  // console.log("Retorno do qrData:", qrData);
  QRCode.toString(qrcodeData, { type: 'terminal', lineWidth: 2 }, (err, qr) => {
    if (err) {
      console.error('Erro ao gerar o QR Code:', err);
      return;
    }
    console.log(qr);
  });
}

fetchQRcode();
