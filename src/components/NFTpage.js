import Navbar from "./Navbar";
import Footer from "./Footer";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { useContract } from '../context/ContractContext';
import { useEffect } from "react";
import { ethers } from "ethers";

export default function NFTPage(props) {
    const [data, updateData] = useState({});
    const [message, updateMessage] = useState("");
    const [dataFetched, updateDataFetched] = useState(false);
    const [tokenId, setTokenId] = useState(0);
    const [accounts, setAccounts] = useState([]);
    const { contract, address, isConnected} = useContract();

    const params = useParams();
    console.log("params.tokenId", params.tokenId);
    // const tokenId = parseInt(params.tokenId.toString());
    const [error, setError] = useState(null);

    async function getNFTData(tokenId) {
        if(contract){
            try {
                //create an NFT Token
            var tokenURI = await contract.tokenURI(tokenId);
            const listedToken = await contract.getListedTokenForId(tokenId);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);
            let meta = await axios.get(tokenURI);
            meta = meta.data;
            console.log("(listedToken", listedToken);

            let item = {
                price: meta.price,
                tokenId: tokenId,
                seller: listedToken.seller,
                owner: listedToken.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            console.log(item);
            updateData(item);
            updateDataFetched(true);
            console.log("address", address)
        } catch (error) {
            console.error("Error en getNFTData:", error);
            updateData(null);
            updateDataFetched(true);
            // Puedes manejar el error de manera específica aquí
        }
    }
    }
    

    async function buyNFT(tokenId) {
        if(contract){
        try {
            // Verificar que data.price no sea undefined
            if (!data?.price) {
                throw new Error("Price is not defined");
            }

            const salePrice = ethers.utils.parseUnits(data?.price.toString(), 'ether')
            updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
            //run the executeSale function
            let transaction = await contract.executeSale(tokenId, { value: salePrice });
            await transaction.wait();
            console.log("Price:", data?.price);
            console.log("Sale Price:", salePrice.toString());

            alert('You successfully bought the NFT!');
            updateMessage("");
        }
        catch (e) {
            console.error("Error buying NFT:", e);
            alert("Upload Error" + e)
        }
    }
    }

    useEffect(() => {
        console.log("isConnected:", isConnected);
        console.log("data:", data);
      }, [isConnected, data]);


    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
                setAccounts(accounts);
            });

            window.ethereum.on('accountsChanged', accounts => {
                setAccounts(accounts);
            });
        }
        const fetchData = async () => {
            if (params.tokenId && !isNaN(params.tokenId)) {
                const tokenId = parseInt(params.tokenId);
                setTokenId(tokenId);
                try {
                    await getNFTData(tokenId);
                } catch (error) {
                    console.error("Error getting NFT data:", error);
                    setError("NFT no encontrado o error al cargar los datos");
                }
            } else {
                setError("Token ID inválido");
            }
        };

        if (!dataFetched) {
            fetchData();
        }
    }, [params.tokenId, dataFetched]);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!dataFetched) {
        return <div className="w-fit mt-60 text-gray-900 text-5xl font-bold bg-gray-100 py-2 px-8 rounded-md">Cargando...</div>;
    }

    if (!data) {
        return <div>No se encontró información para este NFT</div>;
    }

    if (typeof data?.image == "string")
        data.image = GetIpfsUrlFromPinata(data?.image);
    
    return (
        <div className="mb-12" style={{ "minHeight": "100vh" }}>
            <Navbar></Navbar>
            {!isConnected ? (
                    <>
                    <div className="flex flex-col justify-center items-center h-screen">
                    <h2 className="font-bold text-lg lg:text-3xl py-1 px-4 lg:py-2 mb-6 text-gray-100  bg-gray-800 rounded-lg">Please log in to see your NFTs{address}</h2>   
                    </div>
                    </>
                ) : data ? (  
                    <div className="flex flex-col items-center m-5 mt-20 mb-80" >
                <p className="text-xl lg:text-3xl py-1 px-4 lg:py-2 lg:px-12 text-gray-100  bg-gray-800 rounded-lg mt-20">Buy this NFT</p>    
            {/* <img src={data?.image} alt="" className="w-2/5" /> */}
            <img src={data?.image} alt="" className="w-4/5 md:w-2/5 h-auto border-2 border-gray-900 shadow-2xl rounded-lg mt-8" />
            {/* <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5"> */}
            <div className="flex flex-col text-sm lg:text-2xl text-gray-100 w-full md:w-2/3 break-word m-2 mt-4 lg:m-5 mb-24 p-4 lg:p-12 max-w-4xl   bg-gray-900 bg-opacity-70 space-y-8 shadow-2xl rounded-lg border-2 border-gray-900 overflow-ellipsis" >
                <div className="bg-gray-700 py-1 px-4 w-fit rounded-md">
                    Name: {data?.name}
                </div>
                <div className="bg-gray-700 py-1 px-4 w-fit rounded-md">
                    Description: {data?.description}
                </div>
                <div className="bg-gray-800 py-1 px-4 w-fit rounded-md">
                    Price: <span className="">{data?.price + " ETH"}</span>
                </div>
                <div className="bg-gray-700 py-1 px-4 w-fit rounded-md">
                    Owner: <span className="whitespace-nowrap">{data?.owner.toLowerCase() === "0xb5058c943d65f9cb49278ea9edc79b7cef748ffb"? "Garden Tech NFT" : data?.owner}</span>
                </div>
                <div className="bg-gray-700 py-1 px-4 w-fit rounded-md">
                    Seller: <span className="whitespace-nowrap">{data?.seller.toLowerCase() === address.toLowerCase()? "You" : data?.seller}</span>
                </div>
                <div>
                    {/* {address !== data.owner && address !== data?.seller?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                        : <div className="text-emerald-700">You are the owner of this NFT</div>
                    } */}
                    {accounts.length > 0 ?
                        // address.toLowerCase() === data.seller.toLowerCase() || address.toLowerCase() === data.owner.toLowerCase() ?
                        //     <div className="text-white">You are the owner of this NFT</div> : 
                            <div className="flex justify-start"> 
                                <button className="items-end enableEthereumButton bg-sky-500 hover:bg-sky-600 hover:scale-105 text-sky-100 font-bold py-2 px-4 rounded text-lg font-bold" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                            </div>
                        : <div className="text-red-400">
                            Please connect your wallet to buy this NFT
                          </div>
                    }
                    <div className="text-green text-center mt-3">{message}</div>
                </div>
            </div>
        </div> 
                ) : (
        <div className="flex flex-col justify-center items-center h-screen border-2 border-red-600">
            <h2 className="font-bold text-3xl p-4 mb-6 text-white bg-gray-800">No data available</h2>
        </div>
        )}
        <Footer/>
    </div >
    )
}