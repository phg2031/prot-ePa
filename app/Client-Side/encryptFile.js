export async function encryptFile(file, passwordKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const fileArrayBuffer = await file.arrayBuffer();

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    passwordKey,
    fileArrayBuffer
  );

  const encryptedBlob = new Blob([iv, new Uint8Array(encryptedData)], {
    type: 'application/octet-stream',
  });

  return encryptedBlob;
}
