function InfoSection (data) {
    return (
<div className="fixed bottom-28 w-full left-0 right-0 mt-12 flex items-center justify-center shadow-2xl rounded-lg">
          {/* <div className="absolute inset-0 bg-gray-300 opacity-70 rounded-md"></div>*/}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/fondoabajo.jpg)', opacity: 0.7 }}></div> {/* Imagen de fondo con opacidad */}
          <div className="flex justify-center items-center w-full font-bold text-center text-xl text-gray-100  my-2 relative z-10">
          <div className="flex flex-col items-center rounded-md">
              <img className="rounded-md w-2/5 justify-center" src="/images/icono3.png" alt="Icono" />              
              <h3 className="py-1 px-2 mt-4 bg-sky-900 rounded-md">Sube la imagen que desees</h3>
              {/* <p className="">{description}</p> */}
          </div>
          <div className="flex flex-col items-center rounded-md">
              {/* <img className="" alt="Icono" /> */}
              <img className="rounded-md w-2/5 justify-center"  src="/images/icono4.png" alt="Icono" />
              <h3 className="py-1 px-2 mt-4 bg-sky-900 rounded-md">Indica el precio de venta</h3>
              {/* <p className="">{description}</p> */}
            </div>
          <div className="flex flex-col items-center rounded-md">
          <img className="rounded-md w-2/5 justify-center"  src="/images/icono5.png" alt="Icono" />
          <h3 className="py-1 px-2 mt-4 bg-sky-900 rounded-md">Publica tu propio NFT</h3>
              {/* <p className="">{description}</p> */}
            </div>
          <div className="flex flex-col items-center rounded-md">
          <img className="rounded-md w-2/5 justify-center"  src="/images/icono2.png" alt="Icono" />
              <h3 className="py-1 px-2 mt-4 bg-sky-900 rounded-md">Compralo o mantenlo a la venta</h3>
              {/* <p className="">{description}</p> */}
            </div>
            {/* <AppUseSection
              icon="./icono1.png"
              title="Ofertas de Venta"
              description="Vende tu Nft indicando la dirección,  el Id, su precio y fecha tope."
            />
            <AppUseSection
              icon="./icono2.png"
              title="Ofertas de Compra"
              description="Publica el Nft que desees, indicando el precio que deseas pagar."
            />
            <AppUseSection
              icon="./icono3.png"
              title="Aceptar Ofertas"
              description="Acepta ofertas de venta, enviando el precio, o de compra recibiendo el valor"
            />
            <AppUseSection
              icon="./icono4.png"
              title="Cancelar Ofertas"
              description="Cancela pasada la fecha límite, recuperando el ether depositado y la titularidad del NFT."
            /> */}
          </div>
        </div>
    )
}
export default InfoSection;
