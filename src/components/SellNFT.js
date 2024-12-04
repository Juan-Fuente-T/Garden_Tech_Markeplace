import Navbar from "./Navbar";
import Footer from "./Footer";
import Loader from "./Loader";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
// import { useLocation } from "react-router";
import { useContract } from '../context/ContractContext';
import InfoSection from "./InfoSection";

export default function SellNFT() {
    // const { contract, address, isConnected, handleConnection } = useContract();
    const { contract, address, isConnected, handleConnection } = useContract();

    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const [isMinting, setIsMinting] = useState(false);
    // const location = useLocation();

    async function disableButton() {
        const listButton = document.getElementById("list-button")
        listButton.disabled = true
        listButton.style.backgroundColor = "grey";
        listButton.style.opacity = 0.3;
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button")
        listButton.disabled = false
        listButton.style.backgroundColor = "blue";
        listButton.style.color = "white";
        listButton.style.opacity = 1;
    }

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e) {
        var file = e.target.files[0];
        //check for file extension
        try {
            //upload the file to IPFS
            disableButton();
            updateMessage("Uploading image.. please dont click anything!")
            const response = await uploadFileToIPFS(file);
            if (response.success === true) {
                enableButton();
                updateMessage("")
                // console.log("Uploaded image to Pinata: ", response.pinataURL)
                setFileURL(response.pinataURL);
            }
        }
        catch (e) {
            console.error("Error during file upload", e);
        }
    }

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const { name, description, price } = formParams;
        //Make sure that none of the fields are empty
        if (!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields!")
            return -1;
        }

        const nftJSON = {
            name, description, image: fileURL
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success === true) {
                // console.log("Uploaded JSON PinataURL: ", response.pinataURL);
                return response.pinataURL;
            }
        }
        catch (e) {
            console.error("error uploading JSON metadata:", e)
        }
    }

    async function listNFT(e) {
        e.preventDefault();

        //Upload data to IPFS
        try {
            setIsMinting(true);

            if (!validatePrice(formParams.price)) {
                updateMessage("Invalid price!");
                return;
            }
            const metadataURL = await uploadMetadataToIPFS();
            if (metadataURL === -1)
                return;
            // const provider = new ethers.providers.Web3Provider(window.ethereum);
            // const signer = provider.getSigner();
            disableButton();
            updateMessage("Uploading NFT(takes 5 mins).. please dont click anything!")
            // let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)
            //massage the params to be sent to the create NFT request
            const price = ethers.utils.parseUnits(formParams.price, 'ether')
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            //create the NFT
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
            await transaction.wait()

            alert("Successfully listed your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: '' });
            window.location.replace("/")
        }
        catch (e) {
            updateMessage("Oops. The mint failed");
            alert("Upload error" + e)
        } finally {
            setIsMinting(false);
        }
    }

    const validatePrice = (price) => {
        // Asegura que sea un número o un decimal válido
        // const regex = /^\d*\.?\d{0,18}$/;
        const regex = /^\d+(\.\d{1,18})?$/;
        const isValid = regex.test(price);
        // console.log(`Validating price: ${price}, result: ${isValid}`); // Depuración
        return isValid;
    };

    const handlePriceBlur = () => {
        if (!validatePrice(formParams.price)) {
            updateMessage("Invalid price! Enter a valid number with up to 18 decimals.");
        } else {
            updateMessage(""); // Limpia el error si el precio es válido
        }
    };

    return (
        // <div className="min-h-screen w-full mt-36"> {/* Asegura que ocupa toda la altura y ancho de la pantalla */}
        // <div className="h-auto w-full mt-36 mb-60 overflow-y-auto"> {/* Asegura que ocupa toda la altura y ancho de la pantalla */}
        // <div className="flex flex-col h-auto max-h-screen w-full overflow-y-auto" style={{ height: '500px' }}> 
        <div className="flex flex-col min-h-screen w-full">
            <Navbar />
            <div className="flex-grow flex flex-col overflow-y-auto"> {/* CAMBIO: Añadido padding vertical */}
                <div className="flex-grow flex flex-col justify-center items-center w-full px-4 py-8">
                    <div className="mt-16">
                        {isMinting ? Loader("Minting your NFT") : null}
                    </div>
                    {!isConnected ? (
                        <>
                            {/* <div className="flex flex-col flex-grow justify-center items-center my-auto"> */}
                            <div className="flex flex-col justify-center items-center h-full">
                                <h2 className="font-bold text-lg lg:text-3xl py-1 px-4 lg:py-2 mb-6 text-gray-100  bg-gray-800 rounded-lg">Please log in to mint your NFTs{address}</h2>
                                <div>
                                    <button onClick={() => handleConnection(true)} className="enableEthereumButton justify-center bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded text-sm mb-10">
                                        {isConnected ? "Connected" : "Connect"}</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // <div className="flex flex-col flex-grow justify-center items-center w-full-2 z-40 mx-2 overflow-y-auto overflow-x-hidden" >
                        <div className="flex flex-col items-center w-full max-w-[calc(100%-1rem)] mx-auto  mb-52 mt-14" >
                            <p className="text-xl lg:text-3xl py-1 px-4 lg:py-2 lg:px-12 text-gray-100  bg-gray-800 rounded-lg mb-6">Mint your new NFT</p>
                            <form className="text-xl text-gray-100 break-word mx-5 md:mx-8 bg-gray-900 bg-opacity-70 space-y-4 shadow-2xl rounded-lg border-2 border-gray-900 p-4 lg:p-6 w-full md:w-4/5 lg:w-3/5 max-w-none mb-2">
                                <h3 className="text-center font-bold text-gray-100 mb-4">Upload your NFT to the APP</h3>
                                <div className="mb-2">
                                    <label className="block text-gray-100  text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                                    <input className="shadow appearance-none border rounded w-full py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Nombre del NFT" onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name}></input>
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-100  text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="3" id="description" type="text" placeholder="Descripción del NFT" value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })}></textarea>
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-100  text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                                    <input className="shadow appearance-none border rounded w-full py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        pattern="\d*(\.\d{0,18})?" type="number" placeholder="Min 0.01 ETH" step="0.001" min={0.001} onBlur={handlePriceBlur} value={formParams.price} onChange={e => updateFormParams({ ...formParams, price: e.target.value })}></input>
                                </div>
                                <div>
                                    <label className="block text-gray-100 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                                    <input type={"file"} onChange={OnChangeFile}></input>
                                </div>
                                <div className="text-red-500 text-center mt-3">{message}</div>
                                <button onClick={listNFT} className="font-bold text-gray-900 mt-4 w-full bg-gray-400 rounded p-2 shadow-lg hover:bg-gray-300" id="list-button">
                                    Mint NFT
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}