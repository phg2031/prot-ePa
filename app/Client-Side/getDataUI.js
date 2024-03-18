'use client';
import React, { useState } from 'react';
import { readContract, writeContract } from 'wagmi/actions';
import { decryptDataComp } from './decryptData';
import digProtArtifact from '../constants/abi';
import { useAccount } from 'wagmi';
import { decryptFile } from './decryptFile';

const GetHooks = () => {
  const [password, setPassword] = useState('');
  const [filesList, setFilesList] = useState([]);
  const [error, setError] = useState('');
  const { address } = useAccount();
  const [image, setImage] = useState('');

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) {
      setError('Enter password please');
      return;
    }
    try {
      const data = await readContract({
        address: process.env.NEXT_PUBLIC_smart_contract,
        abi: digProtArtifact.abi,
        functionName: 'getPatientFiles',
        args: [address],
      });

      if (data && password) {
        try {
          const decryptedData = await decryptDataComp(data, password, false);
          setFilesList(decryptedData);
        } catch (error) {
          setError('Wrong password');
          console.error('Error while processcing the data: ', error);
        }
      }
    } catch (error) {
      setError(`Couldn't find funct "getPatientFiles": ${error.message}`);
    }
  };

  const getFile = async (cID, fileName) => {
    const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cID}`;
    console.log(url);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response not ok ');
      const blob = await response.blob();
      const decryptedFile = await decryptFile(blob, password, fileName, false);
      setImage(decryptedFile);
    } catch (error) {
      console.error('Error while downloading file: ', error);
      setError('Error while downloading file');
    }
  };
  const removeFile = async (indexToRemove) => {
    const deleteResponse = await writeContract({
      address: process.env.NEXT_PUBLIC_smart_contract,
      abi: digProtArtifact.abi,
      functionName: 'deletePatientFile',
      args: [indexToRemove],
    });
  };

  return (
    <div>
      <div class='parent-container'>
        <form onSubmit={handleSubmit}>
          <input
            className='customInput'
            type='password'
            value={password}
            onChange={handlePasswordChange}
            placeholder='Enter Password'
          />
          <button className='customButton' type='submit'>
            Get Patient Files
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div class='child-container'>
          {filesList.map((file, index) => (
            <li
              key={index}
              onClick={() => getFile(file.ipfsHash, file.fileName)}
            >
              <p>
                <span className='file-number'>File #{index + 1}:</span>{' '}
                {file.fileName}
              </p>
              <button
                style={{ color: 'red' }}
                onClick={() => removeFile(index)}
              >
                {' '}
                Delete
              </button>{' '}
            </li>
          ))}
          {image && <img src={image} alt='Decrypted Image' />}
        </div>
      </div>
    </div>
  );
};

export default GetHooks;
