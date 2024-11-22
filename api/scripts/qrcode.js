import dotenv from 'dotenv';
import qrcode from 'qrcode-terminal';  
import fetch from 'node-fetch';  
dotenv.config(); 

const endpoint = process.env.ZAPMEOW_GENERATE_QRCODE; 

/**
 * cd api/
 * npm run qrcode
 */

async function fetchQRcode() {
  let encoded64 = null;

  while (!encoded64) {
    const response = await fetch(endpoint);
    const qrcodeJson = await response.json();
    encoded64 = qrcodeJson.qrcode;

    if (encoded64) {
      qrcode.generate(encoded64, { small: true });
    } else {
      await new Promise(time => setTimeout(time, 1000)); 
    }
  }
}

fetchQRcode();
