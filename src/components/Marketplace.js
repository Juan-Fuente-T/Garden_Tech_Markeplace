import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import Footer from "./Footer";
import InfoSection from "./InfoSection";
import axios from "axios";
import { useState, useEffect } from "react";
// import { GetIpfsUrlFromPinata } from "../utils";
import { useContract } from '../context/ContractContext';

export default function Marketplace() {
const { contract, isConnected, address, handleConnection } = useContract();
const ethers = require("ethers");

// const [data, updateData] = useState(sampleData);
const [data, updateData] = useState([]);
console.log("data", data);
// console.log("data.price");
// const [dataFetched, updateDataFetched] = useState(false);
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
    try {
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

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
  }
  fetchData();
}, [contract]);


return (
  <div className="min-h-screen w-full mb-12 overflow-y-auto">
      <Navbar></Navbar>
      <div className=" flex flex-col place-items-center mt-32 mb-60 text-center">
        <div className="flex flex-col items-center md:text-xl font-bold text-white">
          <h1 className="text-2xl lg:text-5xl py-2 px-4 lg:py-4 lg:px-8 w-fit mb-4 text-gray-100 bg-gray-800 rounded-lg ">Garden Tech</h1>
          <p className="text-lg lg:text-3xl py-1 px-4 lg:py-3 lg:px-10 w-fit mb-4 text-gray-100  bg-gray-800 rounded-lg">Mint and sell your own NFT </p>
          <p className="text-md lg:text-3xl py-2 px-4 lg:py-2 lg:px-12 text-gray-100  bg-gray-800 rounded-lg">Find the NFT you are looking for </p>
        </div> 
        <div className="grid gap-4 mt-5 justify-between flex-wrap sm:max-w-full md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl text-center sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data.map((data, index) => {
            // return <NFTTile data={value} key={index}></NFTTile>;
            return <NFTTile data={data} key={index}></NFTTile>;
          })}
        </div >
        <div className="flex mt-5 text-center text-gray-900 mb-20" >
          {address && (
            <p className="font-bold text-lg lg:text-xl py-1 px-4 mb-6 mx-4 text-gray-100 bg-gray-800 rounded-md">Wallet Address: {(address.substring(0, 15) + '...')}</p>
          )}
          {!address && (
            <>
            <div className="flex flex-col justify-center items-center mt-8">
                <h2 className="font-bold text-lg lg:text-3xl py-1 px-4 lg:py-2 mb-6 text-gray-100  bg-gray-800 rounded-lg">Please log in to see your NFTs{address}</h2>   
                <div>
                <button onClick={() => handleConnection(true)}  className="enableEthereumButton justify-center bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded text-sm mb-10">
                    {isConnected ? "Connected" : "Connect"}</button>
                </div>
            </div>
            </>
          )}
        </div>
      </div>
      {/* <div className="w-full border-2 border-red-800 px-0 mx-0">
      <InfoSection/>
      </div> */}
      <Footer/>
    </div>
  );
}