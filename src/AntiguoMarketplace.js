import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import Web3 from 'web3';
import { useContract } from '../ContractContext';

export default function Marketplace() {
const { contract, isConnected, address, handleConnection } = useContract();
const ethers = require("ethers");

// const [data, updateData] = useState(sampleData);
const [data, updateData] = useState([]);
console.log("data", data);
// console.log("data.price");
// const [walletAddress, setWalletAddress] = useState(null);
// const [connected, toggleConnect] = useState(false);
const [dataFetched, updateDataFetched] = useState(false);
const [loading, setLoading] = useState(true);

// async function getAllNFTData(tokenId) {
//   try {
//       const ethers = require("ethers");
//       //After adding your Hardhat network to your metamask, this code will get providers and signers
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const addr = await signer.getAddress();
//       //Pull the deployed contract instance
//       let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
//       //create an NFT Token
//       var tokenURI = await contract.tokenURI(tokenId);
//       const listedToken = await contract.getListedTokenForId(tokenId);
//       tokenURI = GetIpfsUrlFromPinata(tokenURI);
//       let meta = await axios.get(tokenURI);
//       meta = meta.data;
//       console.log("(listedToken", listedToken);

//       let item = {
//           price: meta.price,
//           tokenId: tokenId,
//           seller: listedToken.seller,
//           owner: listedToken.owner,
//           image: meta.image,
//           name: meta.name,
//           description: meta.description,
//       }
//       console.log(item);
//       updateData(item);
//       updateDataFetched(true);
//   } catch (error) {
//       console.error("Error en getNFTData:", error);
//       updateData(null);
//       updateDataFetched(true);
//       // Puedes manejar el error de manera específica aquí
//   }
// }

const sampleData = [
  {
    "name": "POP#1",
        "description": "APP's First POP",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
        "price":ethers.utils.parseEther("0.03"),
        "currentlySelling":"True",
        "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
        "tokenId": "1" //No existe el NFT, por lo que no puede obtener datos
        //llamara al numero 1 si existe
    },
    {
        "name": "POP#2",
        "description": "APP's Second POP",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
        "price":ethers.utils.parseEther("0.03"),
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        "tokenId": "2" //No existe el NFT, por lo que no puede obtener datos
        //llamara al numero 2 si existe
    },
    {
        "name": "POP#3",
        "description": "APP's Third POP",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
        "price":ethers.utils.parseEther("0.03"),
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        "tokenId": "123" //No existe el NFT, por lo que no puede obtener datos
        //llamara al numero 3 si existe
    },
];

useEffect(() => {
  const fetchData = async () => {
  if(contract){
    // Obtener el número total de NFTs
    const nftCount = await contract.getCurrentToken();
    console.log("nftCount", nftCount); 
    // Obtener la lista de todos los NFTs
    const allNFTs = await contract.getAllNFTs();

    // Procesar los NFT y actualizar el estado
    const nftData = await Promise.all(allNFTs.map(async (item) => {
      const tokenURI = await contract.tokenURI(item.tokenId);
      console.log("TokenURI Marketplace: ", tokenURI);
      const meta = await axios.get(tokenURI);
      return {
        tokenId: item.tokenId,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        price: item.price,
      };
    }));
    updateData(nftData);
    // console.log("DATA_Marketplace", data);

    // Verificar si hay una cuenta conectada
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    // if (accounts.length > 0) {
    //   const address = accounts[0];
    //   setWalletAddress(address);
    //   toggleConnect(true);
    // } else {
    //   setWalletAddress(null);
    //   toggleConnect(false);
    // }

    setLoading(false);
  };
  }
  fetchData();
}, [contract]);

useEffect(() => {
  // console.log("DATA_Marketplace", data);
}, [data]);

// useEffect(() => {
//   const checkMetaMask = async () => {
//     if (window.ethereum) {
//       try {
//         //const web3 = new Web3(window.ethereum);
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         if (accounts.length > 0) {
//           const address = accounts[0];
//           setWalletAddress(address);
//           toggleConnect(true);
//         } else {
//           console.error("No se seleccionó ninguna cuenta en MetaMask.");
//           setWalletAddress(null);
//           toggleConnect(false);
//         }
//       } catch (error) {
//         console.error("Error al habilitar MetaMask:", error);
//         setWalletAddress(null);
//         toggleConnect(false);
//       }
      
//     } else {
//       console.error("MetaMask no está instalado.");
//       setWalletAddress(null);
//       toggleConnect(false);
//     }
//   };

//   checkMetaMask();
// }, []);

// const connectMetaMask = () => {
//   if (window.ethereum) {
//     /* eslint-disable no-unused-vars */
//     //const web3 = new Web3(window.ethereum);
//       window.ethereum.enable()
//       .then((accounts) => {
//         if (accounts.length > 0) {
//           const address = accounts[0];
//           setWalletAddress(address);
//           toggleConnect(true);
//         } else {
//           console.error("No se seleccionó ninguna cuenta en MetaMask.");
//           setWalletAddress(null);
//           toggleConnect(false);
//         }
//       })
//       .catch((error) => {
//         console.error("Error al habilitar MetaMask:", error);
//         setWalletAddress(null);
//         toggleConnect(false);
//       });
//   } else {
//     console.error("MetaMask no está instalado.");
//     setWalletAddress(null);
//     toggleConnect(false);
//   }
// };
console.log("DATA", data);

return (
    <div>
      <Navbar></Navbar>
      <div className="flex flex-col place-items-center m-10 mt-20 text-center">
        <div className="md:text-xl font-bold text-white">
          <h1 className="md:text-48 font-bold text-white mb-10">Garden Tech</h1>
          <p className="p-2 md:text-xl font-bold text-white bg-gray-700 rounded-md">Encuentra aquí el NFT que buscas</p>
        </div>
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {data.map((data, index) => {
            // return <NFTTile data={value} key={index}></NFTTile>;
            return <NFTTile data={data} key={index}></NFTTile>;
          })}
        </div >
        <div className="flex mt-5 text-center text-white mt-12 mb-12" >
          {address && (
            <p>Wallet Address: {(address.substring(0, 15) + '...')}</p>
          )}
          {!address && (
            <div>
              <p className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center text-white">Connect Your Wallet </p>
              <button onClick={() => handleConnection(true)}  className="enableEthereumButton bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded text-sm mb-10">
                {isConnected ? "Connected" : "Connect"}</button>
            </div>
          )}
        </div>
      </div>
      <footer className="flex justify-center w-full fixed bottom-0 left-0 p-8 bg-gray-300">
        Made with &#10084; by Juan Fuente
      </footer>
    </div>
  );
}