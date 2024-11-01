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
      <div className="w-full fixed top-0 left-0 z-50">
        <nav className="bg-gray-200  text-gray-800 "> 
          {/* <ul className='flex items-end justify-between py-3 bg-transparent text-white pr-5'> */}
         
          <ul className='flex items-end justify-between py-3 pr-5'>
          <li className='flex items-end ml-5 pb-2'>
            <Link to="/"> 
            <img src="/images/garden_tech_logo.png" alt="Garden Tech Logo" width={180} height={120} className="inline-block -mt-2"/>
            <div className='inline-block font-bold text-xl ml-2'>
              NFT Exhibition
            </div>
            </Link>
            </li>
            <li className='w-2/6'>
            <button 
            className="lg:hidden text-gray-800 focus:outline-none" 
            // className="text-gray-800 focus:outline-none" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} // **Cambio: Alternar el menú**
          >
            {isMenuOpen ? 'Close' : 'Menu'} {/* **Cambio: Texto del botón cambia según el estado** */}
          </button>
          <ul className={`flex-col lg:flex lg:flex-row ${isMenuOpen ? 'flex' : 'hidden'} lg:flex justify-between font-bold text-lg`}>
          <li className={`p-2 ${location.pathname === "/" ? 'border-b-2' : ''}`}>
            <Link to="/">NFT Exhibition</Link>
          </li>
          <li className={`p-2 ${location.pathname === "/sellNFT" ? 'border-b-2' : ''}`}>
            <Link to="/sellNFT">List my NFT</Link>
          </li>
          <li className={`p-2 ${location.pathname === "/profile" ? 'border-b-2' : ''}`}>
            <Link to="/profile">NFT Profile</Link>
          </li>
          <li>
            <button onClick={() => handleConnection(true)} className={`enableEthereumButton ${isConnected ? "bg-green-500 hover:bg-green-700" : "bg-rose-500 hover:bg-rose-600"} text-white font-bold py-2 px-4 rounded text-sm`}>
              {isConnected ? "Connected" : "Connect Wallet"}
            </button>
          </li>
        </ul>
        </li>
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
        <div className='text-white text-bold text-right mr-10 text-sm'>
        {address ? `Connected to ${address.substring(0, 15)}...` : "Not Connected. Please login"} 
        </div>
      </div>
    );
  }

  export default Navbar;