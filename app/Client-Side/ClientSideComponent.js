'use client';
import { useAccount } from 'wagmi';
import UploadHook from './uploadHooks';
import GetDataUI from './getDataUI';
import ShareQr from './shareQr';
import { useState, useEffect } from 'react';
import GetPatientData from './getPatientData';

const ClientSideComponent = () => {
  const { isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--foreground-rgb', '0, 0, 0');
      root.style.setProperty('--background-start-rgb', '214, 219, 220');
      root.style.setProperty('--background-end-rgb', '255, 255, 255');
    } else {
      root.style.setProperty('--foreground-rgb', '255, 255, 255');
      root.style.setProperty('--background-start-rgb', '0, 0, 0');
      root.style.setProperty('--background-end-rgb', '0, 0, 0');
    }
    setIsClient(true);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return isClient && isConnected ? (
    <>
      <div>
        <button onClick={toggleTheme} className='customButton'></button>
      </div>
      <div className='inputContainer'>
        <UploadHook />
      </div>
      <div className='inputContainer'>
        <GetDataUI />
      </div>
      <div className='inputContainer'>
        <ShareQr />
      </div>
      <div className='inputContainer'>
        <GetPatientData />
      </div>
    </>
  ) : null;
};

export default ClientSideComponent;
