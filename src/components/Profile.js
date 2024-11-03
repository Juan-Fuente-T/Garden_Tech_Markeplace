import Navbar from "./Navbar";
import Footer from "./Footer";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { ethers } from "ethers";
import NFTTile from "./NFTTile";
import { useContract } from '../context/ContractContext';
import { useEffect, useState  } from "react";

export default function Profile () {
    const [data, updateData] = useState([]);
    // const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const [dataFetched, updateFetched] = useState(false);

    const { contract, address, isConnected, handleConnection } = useContract();

    const params = useParams();
    const tokenId = params.tokenId;

    useEffect(() => {
        if (isConnected && contract && !dataFetched) {
            getNFTData();
        }
    }, [isConnected, contract, dataFetched]);

    async function getNFTData(tokenId) {
        if (!contract) return;
        try {
        let sumPrice = 0;

        //create an NFT Token
        let transaction = await contract.getMyNFTs()

        /*
        * Below function takes the metadata from tokenURI and the data returned by getMyNFTs() contract function
        * and creates an object of information that is to be displayed
        */
        
        const items = await Promise.all(transaction.map(async i => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            sumPrice += Number(price);
            return item;
        }))

        updateData(items);
        updateFetched(true);
        // updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));
    } catch (error) {
        console.error("Error fetching NFT data:", error);
    }
    }

    if(!dataFetched)
        getNFTData(tokenId);

    return (
        <div className="profileClass" style={{"minHeight":"100vh"}}>
            <Navbar />
            <div className="mb-80 text-xs mx-2 my-auto ">
                {!isConnected ? (
                    <>
                    <div >
                    </div>
                    <div className="flex flex-col justify-center items-center h-screen">
                    <h2 className="font-bold text-lg lg:text-3xl py-1 px-4 lg:py-2 mb-6 text-gray-100  bg-gray-800 rounded-lg">Please log in to see your NFTs{address}</h2>   
                    <div>
                        <button onClick={() => handleConnection(true)}  className="enableEthereumButton justify-center bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded text-sm mb-10">
                            {isConnected ? "Connected" : "Connect"}</button>
                        </div>
                    </div>
                    </>
                ) : (
                    <>
                        <div className="flex text-center flex-col items-center mt-10 md:text-2xl text-white">
                            <div className="flex flex-row text-center justify-center mt-10  md:text-2xl">
                                <h2 className="font-bold mt-16 py-1 px-2 lg:p-4 text-gray-100 bg-gray-800 rounded-lg">Your wallet address: {address}</h2>   
                            </div>
                        </div>
                        <div className="flex flex-col items-center lg:flex-row text-center justify-center mt-6 md:text-2xl">
                            <div>
                                <h2 className="font-bold mt-2 py-1 px-2 lg:p-4 text-gray-100 bg-gray-800 rounded-lg">You own this number of NFTs: {data.length}</h2>
                            </div>
                            <div className="lg:ml-20">
                                <h2 className="font-bold mt-2 py-1 px-2 lg:p-4 text-gray-100 bg-gray-800 rounded-lg">Total Value: {totalPrice} ETH</h2>                      
                            </div>
                        </div>
                        <div className="flex flex-col text-center items-center mt-10 mb-4 text-white">
                            <h2 className="font-bold text-xl mt-3 py-1 px-2 lg:p-4 p-3 text-gray-100 bg-gray-800 rounded-lg">Your NFTs</h2>
                            <div className="flex justify-center flex-wrap  max-w-screen-xl gap-4">
                            {/* <div className="grid gap-4 mt-10 justify-center flex-wrap max-w-screen-xl sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> */}
                                {data.map((value, index) => (
                                    <NFTTile data={value} key={index} />
                                ))}
                            </div>
                            <div className="mt-10 mx-auto px-4 font-bold text-lg lg:text-2xl text-gray-800 border-2 border-gray-800 rounded-lg">
                                {data.length === 0 ? "Oops, No NFT data to display":""}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    )
}