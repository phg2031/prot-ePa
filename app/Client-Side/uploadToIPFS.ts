export const uploadFile = async (fileToUpload) => {
  try {
    const data = new FormData();
    data.set('file', fileToUpload);
    const res = await fetch('/api/files', {
      method: 'POST',
      body: data,
    });
    const resData = await res.json();
    return resData.IpfsHash;
  } catch (e) {
    console.log(e);
    alert('Trouble uploading file');
  }
};
