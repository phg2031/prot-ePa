import { generateKey } from './generateKey';
import separateIVFromData from './stringToBuffer';

export const decryptDataComp = async (data, password, QrCode) => {
  try {
    let passwordKey;
    if (QrCode) {
      passwordKey = password;
    } else {
      passwordKey = await generateKey(password);
    }

    const decryptData = data.map((file) => {
      //console.log('das ist file.ipfshash', file.ipfsHash);
      const { iv, encryptedData } = separateIVFromData(file.ipfsHash);
      //console.log(iv, encryptedData);
      return { iv, encryptedData };
    });

    const decryptedData = await Promise.all(
      decryptData.map(async (file) => {
        const decrypted = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: file.iv,
          },
          passwordKey,
          file.encryptedData
        );

        const decoder = new TextDecoder();
        const decoded = decoder.decode(decrypted);
        console.log(decoded);
        const separatorIndex = decoded.indexOf('||');
        const ipfsHash = decoded.substring(0, separatorIndex);
        console.log(ipfsHash);

        const fileName = decoded.substring(separatorIndex + 2);
        console.log(fileName);

        return { ipfsHash, fileName };
      })
    );

    return decryptedData;
  } catch (e) {
    console.error('Fehler bei der Entschlüsselung: ', e);
    throw e;
  }
};
