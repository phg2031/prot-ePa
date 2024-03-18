function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function separateIVFromData(combinedBase64) {
  const combinedBuffer = base64ToArrayBuffer(combinedBase64);
  const iv = combinedBuffer.slice(0, 12); // IV hat eine feste Länge von 12 Bytes
  const encryptedData = combinedBuffer.slice(12); // Rest des Buffers sind die verschlüsselten Daten
  return { iv, encryptedData };
}

export default separateIVFromData;
