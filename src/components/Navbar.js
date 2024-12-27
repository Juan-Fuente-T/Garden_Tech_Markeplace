import { useState } from "react";
import {
  Link,
} from "react-router-dom";
import { useLocation } from 'react-router';
import { useContract } from '../context/ContractContext';

function Navbar() {
  // const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const { address, isConnected, handleConnection } = useContract();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar el menú

  return (
    <div className="w-full fixed top-0 left-0 z-50 overflow-hidden">
      <nav className="bg-gray-200 text-gray-800">
        <ul className='flex flex-wrap items-center lg:items-end justify-between py-3 pr-5 space-x-4'>
          <li className='flex items-center lg:items-end justify-center ml-5 pb-2'>
            <Link className="" to="/">
              {/* <img src="/images/garden_tech_logo.png" alt="Garden Tech Logo" width={180} height={120} className="inline-block -mt-2"/> */}
              <img src="/images/garden_tech_logo.png" alt="Garden Tech Logo" className="inline-block w-32 h-auto md:w-48 lg:w-60 rounded-sm" />
              <div className='inline-block font-bold text-xl ml-2 text-xs lg:text-base'>
                NFT Exhibition
              </div>
            </Link>
          </li>

          <div className="flex-grow" /> {/* Espaciador para empujar el contenido a la derecha */}
          <li className="ml-auto">
            <ul className={`flex-col lg:flex lg:flex-row ${isMenuOpen ? 'flex' : 'hidden'} lg:flex justify-end font-bold text-sm md:text-base lg:text-lg`}>
              <li className={`p-2 ${location.pathname === "/" ? 'border-b-2' : ''} whitespace-nowrap`}>
                <Link to="/">NFT Exhibition</Link>
              </li>
              <li className={`p-2 ${location.pathname === "/sellNFT" ? 'border-b-2' : ''} whitespace-nowrap`}>
                <Link to="/sellNFT">Mint my NFT</Link>
              </li>
              <li className={`p-2 ${location.pathname === "/profile" ? 'border-b-2' : ''} whitespace-nowrap`}>
                <Link to="/profile">NFT Profile</Link>
              </li>
              <li className="ml-4">
                <button onClick={() => handleConnection(true)} className={`enableEthereumButton ${isConnected ? "bg-green-500 hover:bg-green-700" : "bg-rose-500 hover:bg-rose-600"} text-white font-bold py-2 px-4 rounded text-sm whitespace-nowrap  hover:scale-105`}>
                  {isConnected ? "Connected" : "Connect Wallet"}
                </button>
              </li>
            </ul>
          </li>

          {/* Botón del menú para pantallas pequeñas */}
          <button
            className="lg:hidden text-gray-800 focus:outline-none flex flex-wrap items-end bg-sky-700 rounded-md py-1 px-2 text-sky-100 font-bold"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </ul>
        {/* <ul className='lg:flex justify-between font-bold mr-10 text-lg'>
              {location.pathname === "/" ? 
              <li className='border-b-2 hover:pb-0 p-2'>
                <Link to="/">NFT Exhibition</Link>
              </li>
              :
              <li className="hover:border-b-2 hover:border-gray-900 hover:pb-0 p-2">
                <Link to="/">NFT Exhibition</Link>
              </li>              
              }
              {location.pathname === "/sellNFT" ? 
              <li className='border-b-2 hover:pb-0 p-2'>
                <Link to="/sellNFT">List my NFT</Link>
              </li>
              :
              <li className="hover:border-b-2 hover:border-gray-900 hover:pb-0 p-2">
                <Link to="/sellNFT">List my NFT</Link>
              </li>              
              }              
              {location.pathname === "/profile" ? 
              <li className='border-b-2 hover:pb-0 p-2'>
                <Link to="/profile">NFT Profile</Link>
              </li>
              :
              <li className="hover:border-b-2 hover:border-gray-900 hover:pb-0 p-2">
                <Link to="/profile">NFT Profile</Link>
              </li>              
              }  
              <li>
              <button onClick={() => handleConnection(true)}  className={`enableEthereumButton ${isConnected ? "bg-green-500 hover:bg-green-700" : "bg-rose-500 hover:bg-rose-600"} text-white font-bold py-2 px-4 rounded text-sm`}>
               {isConnected? "Connected":"Connect Wallet"}</button>
              </li>
            </ul>
          </li>
          </ul>*/}
      </nav>
      <div className='text-sky-700 font-bold text-center md:text-right md:mr-10  text-md'>
        {/* <div className='text-white text-bold text-right mr-10 text-sm bg-sky-700 w-fit py-1 px-2 flex justify-end'> */}
        {/* {address ? `Connected to ${address.substring(0, 15)}...` : "Not Connected. Please login"}  */}
        {address ? `Connected to ${address.substring(0, 7)}...${address.substring(address.length - 6)}` : "Not Connected. Please login"}
      </div>
    </div>
  );
}

export default Navbar;