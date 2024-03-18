import { generateKey } from './generateKey';

export async function decryptFile(encryptedBlob, password, fileName, QrCode) {
  let passwordKey;
  if (QrCode) {
    passwordKey = password;
  } else {
    passwordKey = await generateKey(password);
  }

  const arrayBuffer = await encryptedBlob.arrayBuffer();
  const iv = arrayBuffer.slice(0, 12);
  const encryptedData = arrayBuffer.slice(12);

  try {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv),
      },
      passwordKey,
      encryptedData
    );

    let mimeType = 'application/octet-stream';
    if (fileName.endsWith('.png')) {
      mimeType = 'image/png';
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (fileName.endsWith('.txt')) {
      mimeType = 'text/plain';
    }
    const decryptedFile = new File([decryptedData], fileName, {
      type: mimeType,
    });
    const imageUrl = URL.createObjectURL(decryptedFile);
    return imageUrl;
  } catch (e) {
    console.error('Fehler beim Entschlüsseln der Daten:', e);
    throw e;
  }
}
