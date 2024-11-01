import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
// import { useLocation } from "react-router";
import { useContract } from '../context/ContractContext';

export default function SellNFT () {
    // const { contract, address, isConnected, handleConnection } = useContract();
    const { address, isConnected, handleConnection } = useContract();
    
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
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
        listButton.style.backgroundColor = "#A500FF";
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
            if(response.success === true) {
                enableButton();
                updateMessage("")
                console.log("Uploaded image to Pinata: ", response.pinataURL)
                setFileURL(response.pinataURL);
                console.log("fileURL updated:", fileURL);
            }
        }
        catch(e) {
            console.log("Error during file upload", e);
        }
    }
    
    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        //Make sure that none of the fields are empty
        if( !name || !description || !price || !fileURL)
        {
            updateMessage("Please fill all the fields!")
            return -1;
        }
    
        const nftJSON = {
            name, description, price, image: fileURL
        }
    
        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to Pinata: ", response);
                console.log("Uploaded JSON PinataURL: ", response.pinataURL);
                return response.pinataURL;
            }
        }
        catch(e) {
            console.log("error uploading JSON metadata:", e)
        }
    }
    
    async function listNFT(e) {
        console.log("listNFT called");
        e.preventDefault();
    
        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1)
                return;
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            disableButton();
            updateMessage("Uploading NFT(takes 5 mins).. please dont click anything!")
    
            //Pull the deployed contract instance
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)
    
            //massage the params to be sent to the create NFT request
            const price = ethers.utils.parseUnits(formParams.price, 'ether')
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()
    
            //actually create the NFT
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
            await transaction.wait()
    
            alert("Successfully listed your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: ''});
            window.location.replace("/")
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }


    return (
        <div className="min-h-screen w-full mb-32"> {/* Asegura que ocupa toda la altura y ancho de la pantalla */}
            <Navbar />
            {!isConnected ? (
                    <>
                    <div className="flex flex-col justify-center items-center h-screen">
                        <h2 className="font-bold text-3xl p-4 mb-6 text-gray-100  bg-gray-800 rounded-lg">Please log in to see your NFTs{address}</h2>   
                        <div>
                        <button onClick={() => handleConnection(true)}  className="enableEthereumButton justify-center bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded text-sm mb-10">
                            {isConnected ? "Connected" : "Connect"}</button>
                        </div>
                    </div>
                    </>
                ) : (
            <div className="min-h-screen flex justify-center items-center w-full mb-60 z-40">
                {/* Ajustamos el form con clases similares al segundo componente */}
                <form className="text-xl text-gray-100 break-word mx-5 md:mx-20 bg-gray-900 bg-opacity-70 space-y-8 shadow-2xl rounded-lg border-2 border-gray-900 p-12  w-full md:w-3/5 max-w-none">
                    <h3 className="text-center font-bold text-gray-100 mb-8">Upload your NFT to the APP</h3>
                    <div className="mb-4">
                        <label className="block text-gray-100  text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Nombre del NFT" onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name}></input>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-100  text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                        <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="Descripción del NFT" value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })}></textarea>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-100  text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.001" min={0.001} value={formParams.price} onChange={e => updateFormParams({ ...formParams, price: e.target.value })}></input>
                    </div>
                    <div>
                        <label className="block text-gray-100  text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                        <input type={"file"} onChange={OnChangeFile}></input>
                    </div>
                    <div className="text-red-500 text-center mt-3">{message}</div>
                    <button onClick={listNFT} className="font-bold text-gray-900 mt-10 w-full bg-gray-400 rounded p-2 shadow-lg hover:bg-gray-300" id="list-button">
                        List NFT
                    </button>
                </form>
            </div>
            )}
            <Footer/>
        </div>
    );
}