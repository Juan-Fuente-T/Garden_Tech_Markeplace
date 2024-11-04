function InfoSection (data) {
    return (
      <div className="fixed bottom-28 w-full mx-auto left-1/2 transform -translate-x-1/2 mt-12 flex items-center justify-center shadow-2xl rounded-lg overflow-hidden">
{/* <div className="fixed bottom-28 w-full mx-auto left-0 right-0 mt-12 flex items-center justify-center shadow-2xl rounded-lg"> */}
          {/* <div className="absolute inset-0 bg-gray-300 opacity-70 rounded-md"></div>*/}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/fondoabajo.jpg)', opacity: 0.7 }}></div> {/* Imagen de fondo con opacidad */}
          {/* <div className="flex justify-center items-center w-full gap-1 mx-1 font-bold text-center text-xs lg:text-xl text-gray-100  my-2 relative z-10"> */}
          <div className="flex justify-center items-center w-full gap-2 font-bold text-center text-xs lg:text-md xl:text-2xl text-gray-100 my-2 relative z-10 px-4">
          <div className="flex flex-col items-center rounded-md">
              <img className="rounded-md w-2/5 justify-center" src="/images/icono3.png" alt="Icono" />              
              {/* <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">Sube la imagen que desees</h3> */}
              <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">Selecciona una imagen</h3>
          </div>
          <div className="flex flex-col items-center rounded-md">
              <img className="rounded-md w-2/5 justify-center"  src="/images/icono4.png" alt="Icono" />
              {/* <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">Indica el precio de venta</h3> */}
              <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">Marca precio de venta</h3>
            </div>
          <div className="flex flex-col items-center rounded-md">
          <img className="rounded-md w-2/5 justify-center"  src="/images/icono5.png" alt="Icono" />
          {/* <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">Publica tu NFT personalizado</h3> */}
          <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">Mintea otro nuevo NFT</h3>
            </div>
          <div className="flex flex-col items-center rounded-md">
          <img className="rounded-md w-2/5 justify-center"  src="/images/icono2.png" alt="Icono" />
              {/* <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">Compralo o mantenlo a la venta</h3> */}
              <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">Compra o vende tu NFT</h3>
            </div>
          </div>
        </div>
    )
}
export default InfoSection;
