import { ConnectButton } from '@rainbow-me/rainbowkit';
import ClientSideComponent from './Client-Side/ClientSideComponent';

export default function YourApp() {
  return (
    <div className='centeredContainer'>
      <ConnectButton />
      <div className='centeredContainer'>
        <ClientSideComponent />
      </div>
    </div>
  );
}
