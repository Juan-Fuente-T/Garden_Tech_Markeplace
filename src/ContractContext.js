// ContractContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MarketplaceJSON from "./Marketplace.json";
// src\assets\constants\index.js

// type ContractContextType = ethers.Contract | null;



const ContractContext = createContext(undefined);

export const ContractProvider = ({ children }) => {
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);

  const handleConnection = async (requestAccounts = false) => {
    console.log("RequestAccounts in Context", requestAccounts);
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
            console.error("No hay cuentas disponibles. Asegúrate de que la wallet esté desbloqueada.");
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
      console.error("Error al conectar:", error);
      setIsConnected(false);
      setAddress(null);
    }
  } else {
    alert('Por favor, instala una wallet como MetaMask o Trust Wallet.');
  }
};

    useEffect(() => {
      // Llama a handleConnection sin solicitar acceso explícito a las cuentas
      handleConnection(false);
    }, []);
   // El array vacío asegura que esto se ejecute solo una vez cuando el componente se monta

  return (
    <ContractContext.Provider value={{ contract, address, isConnected, provider, handleConnection}}>
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