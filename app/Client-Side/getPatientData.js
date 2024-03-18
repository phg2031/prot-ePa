'use client';
import React, { useState, useEffect } from 'react';
import { readContract } from 'wagmi/actions';
import { decryptDataComp } from './decryptData';
import digProtArtifact from '../constants/abi';
import { decryptFile } from './decryptFile';

const GetPatientData = () => {
  const [password, setPassword] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [filesList, setFilesList] = useState([]);
  const [error, setError] = useState('');
  const [address, setAdress] = useState('');
  const [QrTest] = useState('true');
  const [data, setData] = useState('');
  const [image, setImage] = useState('');

  const handleQRChange = (e) => {
    setQrCode(e.target.value);
    setError('');
  };

  const importKey = async (jwkKey) => {
    try {
      const key = await window.crypto.subtle.importKey(
        'jwk',
        jwkKey,
        {
          name: 'AES-GCM',
        },
        true,
        ['encrypt', 'decrypt']
      );
      return key;
    } catch (e) {
      console.error('Error while importing key', e);
      return null;
    }
  };

  const transformQr = async () => {
    const [keyString, newAdress] = qrCode.split(', Address: ');
    const jwkKeyString = keyString.replace('Key: ', '');
    const jwkKey = JSON.parse(jwkKeyString);

    const key = await importKey(jwkKey);
    setPassword(key);
    setAdress(newAdress);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!qrCode) {
      setError('Scan QR-Code please');
      return;
    }
    try {
      await transformQr();
    } catch (error) {
      setError('No valid QR-Code - scan again please');
    }

    setQrCode('');
    return;
  };
  useEffect(() => {
    if (address) {
      (async () => {
        try {
          const data = await readContract({
            address: process.env.NEXT_PUBLIC_smart_contract,
            abi: digProtArtifact.abi,
            functionName: 'getPatientFiles',
            args: [address],
          });
          setData(data);
        } catch (error) {
          setError('Address incorrect - scan again please');
        }
      })();
    }
  }, [address]);
  useEffect(() => {
    if (data && password) {
      (async () => {
        try {
          const decryptedData = await decryptDataComp(data, password, QrTest);
          setFilesList(decryptedData);
          console.log(decryptedData);
        } catch (error) {
          setError('Decryption failed - wrong password?');
        }
      })();
    }
  }, [data, password, QrTest]);

  const getFile = async (cID, fileName) => {
    const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cID}`;
    console.log(url);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response not ok ');
      const blob = await response.blob();
      console.log('das ist der blob', blob);
      const decryptedFile = await decryptFile(blob, password, fileName, true);
      console.log('das ist die decrypted file', decryptedFile);
      setImage(decryptedFile);
    } catch (error) {
      console.error('Error while downloading file: ', error.message);
      setError('Error while downloading file', error);
    }
  };

  return (
    <div class='parent-container'>
      <form onSubmit={handleSubmit}>
        {' '}
        <input
          className='customInput'
          type='password'
          value={qrCode}
          onChange={handleQRChange}
          placeholder='Scan QR-Code'
        />
        <button className='customButton' type='submit' disabled={!qrCode}>
          Get Patient File
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div class='child-container'>
        {filesList.map((file, index) => (
          <li key={index} onClick={() => getFile(file.ipfsHash, file.fileName)}>
            <p>
              <span className='file-number'>File #{index + 1}:</span>{' '}
              {file.fileName}
            </p>
          </li>
        ))}
        {image && <img src={image} alt='Decrypted Image' />}
      </div>
    </div>
  );
};

export default GetPatientData;
