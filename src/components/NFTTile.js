import {
    BrowserRouter as Router,
    Link,
} from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";

// function NFTTile(data) {
//     const newTo = {
//         pathname: "/nftPage/" + data.data.tokenId
//     }

//     const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

//     return (
//         <Link to={newTo}>
//             <div className="border-2 border-gray-800 ml-2 mt-5 mb-12 flex flex-col items-center rounded-lg w-full sm:w-60 md:w-64 lg:w-72 shadow-2xl mx-auto">
//                 <img src={IPFSUrl} alt="" className="w-full h-60 sm:h-64 md:h-72 lg:h-80 rounded-t-lg object-cover" />
//                 <div className="text-gray-200 w-full p-2 bg-gradient-to-t from-[#3F3F46] to-transparent rounded-b-lg pt-5 -mt-16">
//                     <strong className="text-lg md:text-xl">{data.data.name}</strong>
//                     <p className="text-sm md:text-base">
//                         {data.data.description}
//                     </p>
//                 </div>
//             </div>
//         </Link>
//     )
// }

function NFTTile(data) {
    const newTo = {
        pathname: "/nftPage/" + data.data.tokenId
    }

    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

    return (
        <Link to={newTo}>
            {/* <div className="w-full sm:w-4/5 md:w-3/4 lg:w-5/6 mx-auto bg-gray-100 p-4 rounded-lg shadow-md"> */}
            <div className="border-2 border-gray-800 mt-5 mb-8 flex flex-col items-center rounded-lg w-72 md:w-72 shadow-2xl mx-auto object-cover  overflow-hidden ">            <img src={IPFSUrl} alt="NFT" className="w-72 h-80 rounded-lg object-cover" />
                <div className="text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                    {/* <div className= "text-gray-200 w-full p-2 bg-gradient-to-t from-[#3F3F46]  to-transparent rounded-lg pt-5 -mt-20 mx-auto"> */}
                    <strong className="text-xl">{data.data.name}</strong>
                    <p className="display-inline">
                        {data.data.description}
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default NFTTile;
