function InfoSection(data) {
  return (
    <div className="w-full mx-auto mt-4 flex items-center justify-center shadow-2xl  overflow-hidden relative">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/fondoabajo.jpg)', opacity: 0.7 }}
      ></div>

      {/* Contenido con iconos e imágenes redondeadas */}
      <div className="flex justify-center items-center w-full gap-2 font-bold text-center text-xs lg:text-md xl:text-2xl text-gray-100 my-2 relative z-10 px-4">
        <div className="flex flex-col items-center rounded-md">
          <img className="rounded-md w-2/5 md:w-1/5 justify-center" src="/images/icono3.png" alt="Icono" />
          <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">
            Selecciona una imagen
          </h3>
        </div>

        <div className="flex flex-col items-center rounded-md">
          <img className="rounded-md w-2/5 md:w-1/5 justify-center" src="/images/icono4.png" alt="Icono" />
          <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">
            Marca precio de venta
          </h3>
        </div>

        <div className="flex flex-col items-center rounded-md">
          <img className="rounded-md w-2/5 md:w-1/5 justify-center" src="/images/icono5.png" alt="Icono" />
          <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">
            Mintea otro nuevo NFT
          </h3>
        </div>

        <div className="flex flex-col items-center rounded-md">
          <img className="rounded-md w-2/5 md:w-1/5 justify-center" src="/images/icono2.png" alt="Icono" />
          <h3 className="py-1 px-1 mt-2 lg:px-2 lg:mt-4 bg-sky-900 rounded-md flex items-center justify-center min-w-22 h-18">
            Compra o vende tu NFT
          </h3>
        </div>
      </div>
    </div>
  );
}

export default InfoSection;
