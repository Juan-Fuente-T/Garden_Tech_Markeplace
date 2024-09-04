import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { useEffect } from "react";

export default function NFTPage(props) {

    const [data, updateData] = useState({});
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");
    const [dataFetched, updateDataFetched] = useState(false);
    const [tokenId, setTokenId] = useState(0);
    const [accounts, setAccounts] = useState([]);

    async function getNFTData(tokenId) {
        try {
            const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            //Pull the deployed contract instance
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
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
            console.log("address", addr)
            updateCurrAddress(addr);
        } catch (error) {
            console.error("Error en getNFTData:", error);
            updateData(null);
            updateDataFetched(true);
            // Puedes manejar el error de manera específica aquí
        }
    }


    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            //Pull the deployed contract instance
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

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

    const params = useParams();
    console.log("params.tokenId", params.tokenId);
    // const tokenId = parseInt(params.tokenId.toString());
    const [error, setError] = useState(null);

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
        return <div>Cargando...</div>;
    }

    if (!data) {
        return <div>No se encontró información para este NFT</div>;
    }

    if (typeof data?.image == "string")
        data.image = GetIpfsUrlFromPinata(data?.image);


    return (
        <div style={{ "minHeight": "100vh" }}>
            <Navbar></Navbar>
            <div className="flex flex-col items-center m-5 mt-20" >
            {/* <img src={data?.image} alt="" className="w-2/5" /> */}
            <img src={data?.image} alt="" className="w-4/5 md:w-2/5 border-2 border-gray-900 shadow-2xl rounded-lg mt-20" />
            {/* <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5"> */}
            <div className="text-xl text-gray-100 break-word m-5 mb-24 md:mx-20  bg-gray-900 bg-opacity-70  space-y-8 text-white shadow-2xl rounded-lg border-2 border-gray-900 p-12 w-4/5 md:w-3/5 overflow-auto" >
                <div>
                    Name: {data?.name}
                </div>
                <div>
                    Description: {data?.description}
                </div>
                <div>
                    Price: <span className="">{data?.price + " ETH"}</span>
                </div>
                <div>
                    Owner: <span className="text-sm">{data?.owner}</span>
                </div>
                <div>
                    Seller: <span className="text-sm">{data?.seller}</span>
                </div>
                <div>
                    {/* {currAddress !== data.owner && currAddress !== data?.seller?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                        : <div className="text-emerald-700">You are the owner of this NFT</div>
                    } */}
                    {accounts.length > 0 ?
                        currAddress === data.seller || currAddress === data.owner ?
                            <div className="text-white">You are the owner of this NFT</div>
                            : <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                        : <div className="text-red-400">Please connect your wallet to buy this NFT</div>
                    }
                    <div className="text-green text-center mt-3">{message}</div>
                </div>
            </div>
        </div>
        <Footer/>
    </div >
    )
}