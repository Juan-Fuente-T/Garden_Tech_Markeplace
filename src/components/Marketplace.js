import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import Footer from "./Footer";
import Loader from "./Loader";
import InfoSection from "./InfoSection";
import axios from "axios";
import { useState, useEffect } from "react";
// import { GetIpfsUrlFromPinata } from "../utils";
import { useContract } from '../context/ContractContext';

export default function Marketplace() {
  const { contract, isConnected, address, handleConnection } = useContract();
  const ethers = require("ethers");

  const [data, updateData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [allNFTs, setAllNFTs] = useState([]);

  
  //ALTERNATIVA declarando profider, signer y contract
  // async function getAllNFTData(tokenId) {
  //   try {
  //       //This code will get providers and signers
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

  //       let item = {
  //           price: meta.price,
  //           tokenId: tokenId,
  //           seller: listedToken.seller,
  //           owner: listedToken.owner,
  //           image: meta.image,
  //           name: meta.name,
  //           description: meta.description,
  //       }
  //       updateData(item);
  //       updateDataFetched(true);
  //   } catch (error) {
  //       console.error("Error en getNFTData:", error);
  //       updateData(null);
  //       updateDataFetched(true);
  //   }
  // }

  const sampleData = [
    {
      "name": "NFT#1",
      "description": "APP's First NFT",
      "website": "http://asimpleexample.io",
      "image": "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
      "price": ethers.utils.parseEther("0.03"),
      "tokenId": "1" //No existe el NFT, por lo que no puede obtener datos
      //llamara al numero 1 si existe
    },
    {
      "name": "NFT#2",
      "description": "APP's Second NFT",
      "website": "http://asimpleexample.io",
      "image": "https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
      "price": ethers.utils.parseEther("0.03"),
      "tokenId": "2" //No existe el NFT, por lo que no puede obtener datos
      //llamara al numero 2 si existe
    },
    {
      "name": "NFT#3",
      "description": "APP's Third NFT",
      "website": "http://asimpleexample.io",
      "image": "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
      "price": ethers.utils.parseEther("0.03"),
      // "currentlySelling":"True",
      // "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
      "tokenId": "3" //No existe el NFT, por lo que no puede obtener datos
      //llamará al numero 3 si existe
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (contract && address) {
        let currentStart = 0;
        const limit = 9;
        let allNFTs = [];
        let moreTokens = true;
        try {;
          while (moreTokens) {
            // Llamar al contrato para obtener NFTs desde 'currentStart' con un límite de 'limit'
            const tokens = await contract.getAllNFTs(currentStart, limit);
            if (tokens && tokens.length > 0) {
              const processedNFTs = tokens.map((token) => ({
                tokenId: token.tokenId.toString(),
                price: ethers.utils.formatEther(token.price),
                owner: token.owner,
                seller: token.seller,
                currentlyListed: token.isCurrentlyListed
              }));
              // Añadir los NFTs obtenidos a la lista total
              allNFTs = [...allNFTs, ...processedNFTs];
              currentStart += limit;  // Aumentamos el start para la próxima llamada
            } else {
              moreTokens = false;  // Si no hay más tokens, salimos del bucle
            }
          }
          console.log("allNFT", allNFTs);
          // Procesar los NFT y actualizar el estado
          const nftData = await Promise.all(allNFTs.map(async (item) => {
            const tokenURI = await contract.tokenURI(item.tokenId);
            const meta = await axios.get(tokenURI);
            return {
              tokenId: item.tokenId.toString(),
              image: meta.data.image,
              name: meta.data.name,
              description: meta.data.description,
              price: item.price.toString(),
            };
          }));
          console.log("NFT data", nftData);
          updateData(nftData);

          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };
    }
    fetchData();
  }, [address]);



  return (
    <div className="flex flex-col min-h-screen"> {/* CAMBIO: h-screen a min-h-screen */}
      <Navbar />
      <div className="flex-grow flex items-center justify-center mb-8 pt-24 pb-40"> {/* CAMBIO: Eliminado overflow-y-auto */}
        {loading && address ? (
          <Loader loadingText={"Downloading..."} />
        ) : (
          <div className="flex flex-col place-items-center w-full max-w-screen-s2xl mx-auto px-4"> {/* CAMBIO: Ajustado contenedor principal */}
            <div className="flex flex-col items-center md:text-xl font-bold text-white mb-8">
              <h1 className="text-2xl lg:text-4xl py-2 px-4 lg:py-1 lg:px-8 w-fit mb-4 text-gray-100 bg-gray-800 rounded-lg ">Garden Tech</h1>
              <p className="text-lg lg:text-2xl py-1 px-4 lg:py-1 lg:px-8 w-fit mb-4 text-gray-100  bg-gray-800 rounded-lg">Mint and sell your own NFT </p>
              <p className="text-md lg:text-xl py-2 px-4 lg:py-1 lg:px-12 text-gray-100  bg-gray-800 rounded-lg">Find the NFT you are looking for </p>
            </div>
            {/* CAMBIO: Reemplazado grid con flex */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              {data.map((data, index) => (
                <NFTTile data={data} key={index} />
              ))}
            </div>
            <div className="text-center text-gray-900 mb-4">
              {/* {address && (
                <p className="font-bold text-lg lg:text-xl py-1 px-4 mb-6 mx-4 text-gray-100 bg-gray-800 rounded-md">Wallet Address: {(address.substring(0, 15) + '...')}</p>
              )} */}
              {!address && (
                <div className="flex flex-col justify-center items-center mt-4">
                  <h2 className="font-bold text-lg lg:text-3xl py-1 px-4 lg:py-2 mb-6 text-gray-100  bg-gray-800 rounded-lg">Please log in to see the NFTs{address}</h2>
                  <button onClick={() => handleConnection(true)} className="enableEthereumButton justify-center bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded text-sm mb-10">
                    {isConnected ? "Connected" : "Connect"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-auto w-full">
        <Footer />
      </div>
    </div>
  );
}