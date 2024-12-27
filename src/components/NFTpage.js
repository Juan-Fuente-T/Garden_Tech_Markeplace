import Navbar from "./Navbar";
import Footer from "./Footer";
import ModalChangePrice from "./ModalChangePrice";
import { useParams } from 'react-router-dom';
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
    const [listPrice, setListPrice] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const { contract, address, isConnected } = useContract();

    const params = useParams();
    // console.log("params.tokenId", params.tokenId);
    // const tokenId = parseInt(params.tokenId.toString());
    const [error, setError] = useState(null);

    async function getNFTData(tokenId) {
        if (contract) {
            try {
                const listPrice = await contract.getListPrice();
                setListPrice(listPrice);
                var tokenURI = await contract.tokenURI(tokenId);
                const listedToken = await contract.getListedTokenForId(tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;

                let item = {
                    price: ethers.utils.formatEther(listedToken.price), // Ajusta el precio para que se muestre en etherlistedToken.price,
                    tokenId: tokenId,
                    owner: listedToken.owner,
                    seller: listedToken.seller,
                    currentlyListed: listedToken.currentlyListed,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                }
                // console.log("item", item);  
                updateData(item);
                updateDataFetched(true);
            } catch (error) {
                console.error("Error en getNFTData:", error);
                updateData(null);
                updateDataFetched(true);
            }
        }
    }


    async function buyNFT(tokenId, sell) {
        if (contract && tokenId) {
            try {
                if (!data?.price) {
                    throw new Error("Price is not defined");
                }

                const basePrice = data?.price.toString();
                const salePrice = sell
                    ? basePrice + listPrice
                    : basePrice;
                const _salePrice = ethers.utils.parseEther(salePrice.toString());
                updateMessage("Buying the NFT... Please Wait (Upto 2 mins)")
                //run the executeSale function
                const transaction = await contract.executeSale(tokenId, sell, { value: _salePrice });
                await transaction.wait();
                sell === false ? alert('You successfully claim the NFT!') : alert('You successfully bought the NFT!');
                updateMessage("");
                getNFTData(tokenId);
            }
            catch (e) {
                console.error("Error buying NFT:", e);
                alert("Upload Error" + e)
                updateMessage("");
            }
        }
    }

    async function changeNFTPrice(tokenId, newPrice) {
        if (contract && isConnected && tokenId) {
            try {
                if (!newPrice) {
                    throw new Error("Price is not defined");
                }
                const newSalePrice = ethers.utils.parseUnits(newPrice.toString(), 'ether')
                updateMessage("Changing the NFT price... Please Wait (Upto 2 mins)")
                //run the executeSale function
                let transaction = await contract.changeNFTPrice(tokenId, newSalePrice);
                await transaction.wait();

                alert('You successfully changed the NFT price!');
                updateMessage("");
                getNFTData(tokenId);
            }
            catch (e) {
                console.error("Error changing the NFT price:", e);
                alert("Upload Error" + e)
                updateMessage("");
            }
        }
    }

    useEffect(() => {
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
        // return <div>No se encontró información para este NFT</div>;
        return <div className="w-fit mt-52 text-gray-900 text-3xl font-bold bg-gray-100 py-2 px-8 rounded-md">Dont exist information for this NFT</div>;
    }

    if (typeof data?.image == "string")
        data.image = GetIpfsUrlFromPinata(data?.image);
    return (
        <div className="mb-12" style={{ "minHeight": "100vh" }}>
            <Navbar></Navbar>
            {!isConnected ? (
                <>
                    {/* <div className="flex flex-col justify-center items-center h-screen"> */}
                    <div className="flex flex-col justify-center items-center">
                        <h2 className="font-bold text-lg lg:text-3xl py-1 px-4 lg:py-2 mb-6 text-gray-100  bg-gray-800 rounded-lg">Please log in to see your NFTs{address}</h2>
                    </div>
                </>
            ) : data ? (
                <div className="flex flex-col items-center m-5 mt-12 mb-80" >
                    <p className="text-xl lg:text-3xl py-1 px-4 lg:py-2x lg:px-12 text-gray-100 bg-gray-800 rounded-lg mt-20 mb-8">Buy this NFT</p>
                    {/* <img src={data?.image} alt="" className="w-2/5" /> */}
                    <div className="flex flex-col xl:flex-row justify-center items-center">
                        <img src={data?.image} alt="" className="w-full md:w-3/5 xl:w-2/5 h-auto border-2 border-gray-900 shadow-2xl rounded-lg m-4 lg:m-4 mt-8" />
                        {/* <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5"> */}
                        <div className="flex flex-col text-xs lg:text-2xl text-gray-100 w-fit md:w-2/3 lg:w-fit max-w-4xl break-all m-0 lg:m-4 md:mt-4 md:mb-24 p-4 lg:p-12 bg-gray-900 bg-opacity-70 space-y-4 shadow-2xl rounded-lg border-2 border-gray-900 overflow-ellipsis" >
                            <div className="bg-gray-700 py-1 px-4 w-fit rounded-md">
                                Name: {data?.name}
                            </div>
                            <div className="bg-gray-700 py-1 px-4 w-fit rounded-md">
                                Description: {data?.description}
                            </div>
                            <div className="bg-gray-800 py-1 px-4 w-fit rounded-md">
                                Price: <span className="">{data?.price + " ETH"}</span>
                            </div>
                            {/* <div className="bg-gray-700 py-1 px-4 w-fit rounded-md">
                                Owner: <span className="whitespace-nowrap">{data?.owner.toLowerCase() === "0xb5058c943d65f9cb49278ea9edc79b7cef748ffb" ? "Garden Tech NFT" : data?.owner}</span>
                            </div> */}
                            <div className="bg-gray-700 py-1 px-4 w-fit rounded-md">
                                Seller: <span className="whitespace-normal break-words">{data?.seller.toLowerCase() === address.toLowerCase() ? "You" : data?.seller}</span>
                            </div>
                            <div className="flex flex-col xl:flex-row gap-2 text-xs lg:text-xl">
                                <div className="bg-gray-700 py-1 px-4 rounded-md flex items-center">
                                    <span className="mr-2 whitespace-nowrap">To import:</span>
                                    <span className="bg-gray-800 px-2 py-1 rounded whitespace-normal break-words">
                                        {data?.owner ? data?.owner : ""}
                                    </span>
                                </div>
                                <div className="w-fit bg-gray-700 py-1 px-4 rounded-md flex items-center">
                                    <span className="mr-2 whitespace-nowrap">Id:</span>
                                    <span className="bg-gray-800 px-2 py-1 rounded whitespace-nowrap">
                                        {data?.tokenId ? data.tokenId : ""}
                                    </span>
                                </div>
                            </div>
                            <div>
                            </div>
                            {/* {address !== data.owner && address !== data?.seller?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                        : <div className="text-emerald-700">You are the owner of this NFT</div>
                    } */}
                            {accounts.length > 0 ?
                                // address.toLowerCase() === data.seller.toLowerCase() || address.toLowerCase() === data.owner.toLowerCase() ?
                                //     <div className="text-white">You are the owner of this NFT</div> : 
                                // <div className="flex justify-start">
                                //     <button className="items-end enableEthereumButton bg-sky-500 hover:bg-sky-600 hover:scale-105 text-sky-100 font-bold py-2 px-4 rounded text-lg font-bold" 
                                //     onClick={() => buyNFT(data?.tokenId , data?.seller.toLowerCase() !== address.toLowerCase())}
                                //     >
                                //       {data.seller.toLowerCase() === address.toLowerCase() ? "Claim" : "Buy"}
                                //     </button>
                                // </div>
                                <div className="flex justify-start">
                                    {data?.seller.toLowerCase() === address.toLowerCase() ? (
                                        // Si la dirección es del dueño, muestra solo "Claim"
                                        data?.currentlyListed ? (
                                            <>
                                                <button
                                                    className="bg-blue-600 hover:bg-blue-800 hover:scale-105 text-white font-bold py-2 px-4 rounded mr-2"
                                                    onClick={() => buyNFT(data.tokenId, false)} // Pasamos `false` para retirar del marketplace
                                                >
                                                    Claim
                                                </button><button
                                                    className="bg-blue-700 hover:bg-blue-800  hover:scale-105 text-white font-bold py-2 px-4 rounded"
                                                    onClick={openModal}
                                                >
                                                    Change NFT Price
                                                </button>
                                            </>
                                        ) : null
                                    ) : (
                                        // Si la dirección NO es del dueño, muestra "Buy and Claim" y "Buy and Sell"
                                        <>
                                            <button
                                                className="bg-blue-600 hover:bg-blue-800 hover:scale-105 text-white font-bold py-2 px-4 rounded mr-2"
                                                onClick={() => buyNFT(data.tokenId, false)} // Pasamos `false` para comprar y retirar del marketplace
                                            >
                                                Buy and Claim
                                            </button>
                                            <button
                                                className="bg-blue-700 hover:bg-blue-800 hover:scale-105 text-white font-bold py-2 px-4 rounded"
                                                onClick={() => buyNFT(data.tokenId, true)} // Pasamos `true` para comprar y listar nuevamente
                                            >
                                                Buy and Sell
                                            </button>
                                        </>
                                    )}
                                    <ModalChangePrice
                                        show={showModal}
                                        onClose={closeModal}
                                        changeNFTPrice={changeNFTPrice}
                                        tokenId={data.tokenId} // Asegúrate de que `tokenId` esté disponible en este scope.
                                    />
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
                <div className="flex flex-col justify-center items-center border-2 border-red-600">
                    <h2 className="font-bold text-3xl p-4 mb-6 text-white bg-gray-800">No data available</h2>
                </div>
            )}
            <Footer />
        </div >
    )
}