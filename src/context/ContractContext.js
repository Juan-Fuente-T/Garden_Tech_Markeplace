// ContractContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MarketplaceJSON from "../Marketplace.json";
// src\assets\constants\index.js

// type ContractContextType = ethers.Contract | null;


const expectedChainId = '0xaa36a7';

const ContractContext = createContext(undefined);

export const ContractProvider = ({ children }) => {
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);

  const handleConnection = async (requestAccounts = false) => {

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      try {
        let accounts;
        // Si requestAccounts es verdadero, solicitará la conexión
        if (requestAccounts) {
          accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else {
          accounts = await window.ethereum.request({ method: 'eth_accounts' });
        }

        if (accounts.length === 0) {
          console.error("There are no accounts available. Make sure the wallet is unlocked.");
          setIsConnected(false);
          setAddress(null);
          return;
        }

        const signer = provider.getSigner();
        const userAddress = accounts[0]; // Usa la cuenta obtenida

        setAddress(userAddress);
        setIsConnected(true);

        // Inicializar contrato 
        const contractAInstance = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        setContract(contractAInstance);

        await checkNetwork();

        // Manejo de cambio de cuentas
        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length > 0) {
            setAddress(newAccounts[0]);
            setIsConnected(true);
          } else {
            setAddress(null);
            setIsConnected(false);
          }
        });

        // Manejo de cambio de red
        window.ethereum.on('chainChanged', (chainId) => {
          // Si la red cambia, podemos recargar la página para adaptarse a la nueva red
          window.location.reload();
        });

      } catch (error) {
        console.error("Connection failed: ", error);
        setIsConnected(false);
        setAddress(null);
      }
    } else {
      alert('No wallet detected. Please install Metamask or another wallet.');
    }
  };

  const checkNetwork = async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== expectedChainId) {
        alert('Please switch to the correct network in the wallet');
        // Intentar cambiar la red automáticamente
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          });
        } catch (error) {
          console.error('Failed to switch network:', error);
        }
      }
    }
  };
  useEffect(() => {
    // Llama a handleConnection sin solicitar acceso explícito a las cuentas
    handleConnection(false);
    checkNetwork();
  }, []);

  return (
    <ContractContext.Provider value={{ contract, address, isConnected, provider, handleConnection }}>
      {children}
    </ContractContext.Provider>
  );
};

// Hook para usar el contexto fácilmente
export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};