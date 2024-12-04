import Navbar from "./Navbar";
import Footer from "./Footer";
import InfoSection from "./InfoSection";
import Loader from "./Loader";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { ethers } from "ethers";
import NFTTile from "./NFTTile";
import { useContract } from '../context/ContractContext';
import { useEffect, useState } from "react";

export default function Profile() {
    const [data, updateData] = useState([]);
    const [totalPrice, updateTotalPrice] = useState("0");
    const [dataFetched, updateFetched] = useState(false);
    const [loading, setLoading] = useState(true);

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
                // console.log("item", item);
                sumPrice += Number(price);
                return item;
            }))
            updateData(items);
            updateFetched(true);
            setLoading(false);
            // updateAddress(addr);
            updateTotalPrice(sumPrice.toPrecision(3));
        } catch (error) {
            console.error("Error fetching NFT data:", error);
        }
    }

    if (!dataFetched) getNFTData(tokenId);
    
    return (
        // <div className="profileClass" style={{ "minHeight": "100vh" }}>
        // <div className="flex flex-col min-h-screen">
        // <div className="flex flex-col h-screen overflow-y-auto mb-36">
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-grow items-center justify-center overflow-y-auto">
            <div className="flex-grow flex flex-col items-center justify-center pb-32"> 
            {loading && address ? <Loader loadingText={"Downloading..."} /> : null}
                {/* <div className="mb-80 text-xs mx-2 my-auto "> */}
                {/* <div className="text-xs mx-2 my-auto"> */}
                {!isConnected ? (
                        <div className="flex flex-col justify-center items-center">
                            <h2 className="font-bold text-lg lg:text-3xl py-1 px-4 lg:py-2 mb-6 text-gray-100  bg-gray-800 rounded-lg">Please log in to see your NFTs{address}</h2>
                            <div>
                                <button onClick={() => handleConnection(true)} className="enableEthereumButton justify-center bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded text-sm mb-10">
                                    {isConnected ? "Connected" : "Connect"}</button>
                            </div>
                        </div>
                ) : (
                    <div className="flex flex-col items-center w-full p-4 overflow-y-auto"> 
                        <div className="flex text-center flex-col items-center md:text-2xl text-white">
                            <div className="flex flex-row text-center justify-center md:text-2xl">
                                <h2 className="text-sm font-bold py-2 px-2 text-gray-100 bg-gray-800 rounded-lg mt-4">Your wallet address: {address}</h2>
                            </div>
                        </div>
                        <div className="flex flex-col items-center lg:flex-row text-center justify-center mt-6 md:text-2xl">
                            <div>
                                <h2 className="font-bold mt-1 py-1 px-8 text-gray-100 bg-gray-800 rounded-lg">You own this number of NFTs: {data.length}</h2>
                            </div>
                            <div className="lg:ml-20">
                                <h2 className="font-bold mt-1 py-1 px-8 text-gray-100 bg-gray-800 rounded-lg">Total Value: {totalPrice} ETH</h2>
                            </div>
                        </div>
                        <div className="flex flex-col text-center items-center mt-10 mb-4 text-white">
                            <h2 className="font-bold text-lg py-1 px-8  text-gray-100 bg-gray-800 rounded-lg">Your NFTs</h2>
                            <div className="flex justify-center flex-wrap max-w-screen-xl gap-4">
                                {data.map((value, index) => (
                                    <NFTTile data={value} key={index} />
                                ))}
                            </div>
                            {data.length === 0 && (
                                <div className="mt-10 mx-auto px-4 font-bold text-lg lg:text-2xl text-gray-800 border-2 border-gray-800 rounded-lg">
                                    Oops, No NFT data to display
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* <div className="mt-auto relative z-10"> */}
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
        </div>
    )
}