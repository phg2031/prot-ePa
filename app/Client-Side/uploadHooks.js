'use client';
import React, { useState, useEffect } from 'react';
import { useContractWrite, usePrepareContractWrite, useAccount } from 'wagmi';
import digProtArtifact from '../constants/abi';
import { generateKey } from './generateKey';

import { uploadFile } from './uploadToIPFS.ts';
import { encryptFile } from './encryptFile';

const UploadHook = () => {
  const contractAddress = process.env.NEXT_PUBLIC_smart_contract;

  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [encryptedCid, setencryptedCid] = useState(false);
  const [inputBuffer, setInputBuffer] = useState();
  const [files, setFiles] = useState([]);
  const { address } = useAccount();
  const [fileName, setFileName] = useState('');
  const [cid, setCid] = useState('');

  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: digProtArtifact.abi,
    functionName: 'uploadPatientFile',
    args: [encryptedCid],
  });

  const { write } = useContractWrite(config);

  useEffect(() => {
    if (encryptedCid) {
      write?.();
    }
  }, [encryptedCid, write]);

  const removeFileFromList = async (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadClick = async () => {
    setIsModalOpen(true);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleFileChange = (event) => {
    const updatedFiles = [...files, ...Array.from(event.target.files)];
    setFiles(updatedFiles);
    const fileNamesString = updatedFiles.map((file) => file.name).join('\n');
    const encoder = new TextEncoder();
    const fileBuffer = encoder.encode(fileNamesString);

    setInputBuffer(fileBuffer);
    console.log('das ist der filename', fileNamesString);
    const fileNames = updatedFiles.map((file) => file.name).join(', ');
    setFileName(fileNames);
    console.log(fileName);
  };
  const encodeCid = (ipfs) => {
    const encoder = new TextEncoder();
    return encoder.encode(ipfs);
  };

  const handleSubmit = async () => {
    const passwordKey = await generateKey(password);
    const encryptedBlob = await encryptFile(files[0], passwordKey);
    const ipfsHash = await uploadFile(encryptedBlob);
    const HashName = ipfsHash + '||' + files[0].name;
    console.log('das sollte der Hashname sein', HashName);
    const encodedCid = encodeCid(HashName);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedCID = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      passwordKey,
      encodedCid
    );
    const ivBase64 = arrayBufferToBase64(iv);
    const encryptedDataBase64 = arrayBufferToBase64(encryptedCID);

    setencryptedCid(ivBase64 + encryptedDataBase64);
  };

  function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  return (
    <div>
      <input
        className='customInput'
        type='file'
        onChange={handleFileChange}
        placeholder='Upload'
        multiple
      />
      <button
        disabled={files.length === 0}
        className='customButton'
        onClick={handleUploadClick}
      >
        Upload
      </button>
      <div>
        <ul>
          {files.map((file, index) => (
            <li key={index}>
              {file.name}
              <button
                style={{ color: 'red', marginLeft: '10px' }} // 10px Abstand hinzufügen
                onClick={() => removeFileFromList(index)}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      </div>
      {isModalOpen && (
        <div className='modal'>
          <input
            className='customInput'
            type='password'
            value={password}
            onChange={handlePasswordChange}
            placeholder='Passwort eingeben'
          />
          <button
            className='customButton'
            disabled={!password}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}
      {cid && (
        <img
          src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`}
          alt='Image from IPFS'
        />
      )}
    </div>
  );
};

export default UploadHook;
