import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { generateKey } from './generateKey';
import { QRCodeSVG } from 'qrcode.react';

const ShareQr = () => {
  const [password, setPassword] = useState('');
  const [qrValue, setQrValue] = useState('');
  const { address } = useAccount();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) {
      console.log('Passwort ist erforderlich');
      return;
    }

    try {
      const passwordKey = await generateKey(password);
      const exportKey = async (key) => {
        const exported = await window.crypto.subtle.exportKey('jwk', key);
        return JSON.stringify(exported);
      };
      const combinedData = `Key: ${await exportKey(
        passwordKey
      )}, Address: ${address}`;
      setQrValue(combinedData);
      console.log(combinedData);
    } catch (e) {
      console.error('Fehler bei der Schlüsselgenerierung:', e);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          className='customInput'
          type='password'
          value={password}
          onChange={handlePasswordChange}
          placeholder='Enter password'
        />
        <button disabled={!password} className='customButton' type='submit'>
          Generate QR Code
        </button>
      </form>
      {qrValue && (
        <div className='qr-container'>
          <QRCodeSVG value={qrValue} />
        </div>
      )}
    </div>
  );
};

export default ShareQr;
