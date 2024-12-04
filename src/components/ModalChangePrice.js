// ConfirmationModal.tsx
import React from 'react';
// import '../styles/ModalConfirmation.css'; // Asegúrate de crear este archivo CSS
// import { Modal, Button } from 'react-bootstrap'; 
// import truncateEthAddress from 'truncate-eth-address';


// interface ConfirmationModalProps {
//   show: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   offer: any;
// }

/**
 * Renders a confirmation modal with details of an offer and actions to confirm or cancel.
 *
 * @param {boolean} show - Whether the modal should be displayed.
 * @param {() => void} props.onClose - Callback function to close the modal.
 * @param {() => void} props.onConfirm  - Callback function to confirm the offer.
 * @param {any} props.offer - Details of the offer to be displayed.
 * @return {JSX.Element|null} The modal component or null if it should not be displayed.
 */

// CancelationModal muestra una confirmación antes de cancelar una oferta.
// Permite al usuario revisar los detalles de la oferta antes de confirmar la cancelación.
const ModalChangePrice = ({ show, onClose, changeNFTPrice, tokenId }) => {
    const [newPrice, setNewPrice] = React.useState(0);
    const [isChangingPrice, setIsChangingPrice] = React.useState(false);

    if (!show) return null; // No renderiza nada si el modal no debe mostrarse

    const handleClose = () => {
        setNewPrice(""); // Restablece el valor del input
        onClose();
      };
    // Validación del precio
    const validatePrice = (price) => {
        // Asegura que sea un número o un decimal válido
        const regex = /^\d*\.?\d{0,18}$/;
        return regex.test(price);
    };

    const handlePriceBlur = () => {
        if (!validatePrice(newPrice)) {
            alert("Invalid price! Enter a valid number with up to 18 decimals.");
        } 
    };

    const handleSubmit = async () => {
        setIsChangingPrice(true);
        if (!newPrice || !validatePrice(newPrice)) {
            alert("Por favor, introduce un precio válido.");
            setIsChangingPrice(false);
            return;
        }
        try{
            await changeNFTPrice(tokenId, newPrice);
        } catch (e) {
            console.error("Error changing the NFT price:", e);
            alert("Upload Error" + e)
        }finally {
            setIsChangingPrice(false);
        }
        handleClose(); // Cierra el modal después de completar la acción.
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-200 w-full max-w-lg p-6 rounded-lg shadow-lg relative flex flex-col space-y-4">
                {/* Botón para cerrar el modal */}
                <button
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                    onClick={handleClose}
                >
                    ✕
                </button>

                {/* Título */}
                <h2 className="text-xl font-semibold text-gray-800">Change the NFT price</h2>

                {/* Campo para el nuevo precio */}
                <div>
                    <label
                        htmlFor="newPrice"
                        className="block text-sm font-medium text-gray-700"
                    >
                        New price
                    </label>
                    <input
                        type="text"
                        id="newPrice"
                        name="newPrice"
                        pattern="\d*(\.\d{0,18})?"
                        placeholder="Ejemplo: 0.01 ETH"
                        min={0}
                        step={0.001}
                        value={newPrice}
                        onBlur={handlePriceBlur}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-4">
                    <button
                        className="px-4 py-2 bg-gray-400 text-gray-700 rounded hover:bg-gray-500 hover:scale-105"
                        disabled={isChangingPrice}
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isChangingPrice}
                        onClick={handleSubmit}
                    >
                        Change price
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalChangePrice;