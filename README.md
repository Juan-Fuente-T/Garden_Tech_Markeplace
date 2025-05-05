# Garden Tech NFT Marketplace 🌳🖼️

## Descripción Breve

Una Aplicación Descentralizada (DApp) full-stack construida sobre la red de pruebas **Sepolia (Ethereum)** que funciona como un marketplace para **crear (mintear), vender y comprar NFTs**. El proyecto implementa almacenamiento descentralizado con **IPFS** y utiliza el patrón **UUPS Proxy** para permitir la actualización de los smart contracts.

`![Garden Tech Marketplace Screenshot](src/assets/GardenTechImage1.png)`

`![Foundry Test Coverage](src/assets/GardenTechTestCoverage.png)`

## Características Principales ✨

* **Minting de NFTs:** Permite a los usuarios crear NFTs únicos subiendo una imagen y proporcionando metadatos (nombre, descripción, precio).
* **Almacenamiento en IPFS:** Las imágenes y metadatos de los NFTs se suben y almacenan de forma descentralizada en IPFS, guardando solo el CID en el smart contract.
* **Marketplace Funcional:** Los usuarios pueden listar sus NFTs a la venta, explorar los NFTs disponibles en el mercado y comprarlos conectando su wallet.
* **Lógica de Compra Flexible:** Al adquirir un NFT, se puede optar por mantenerlo listado para reventa o retirarlo completamente del mercado.
* **Gestión de Propiedad:** Los propietarios de NFTs pueden modificar el precio de venta de sus activos listados o retirarlos del mercado.
* **Perfil de Usuario:** Muestra los NFTs que el usuario conectado ha minteado o posee actualmente.
* **Dashboard Básico:** Indica el número total de NFTs minteados y actualmente en venta en la plataforma.
* **Contratos Actualizables (UUPS Proxy):** El smart contract principal implementa el patrón UUPS Proxy, permitiendo futuras actualizaciones de la lógica sin perder el estado ni cambiar la dirección del contrato principal.
* **Alta Cobertura de Tests:** Los smart contracts fueron desarrollados con un fuerte enfoque en la calidad, alcanzando una **cobertura de testing unitario superior al 90%** utilizando Foundry (contrato principal >99%).

## Tecnologías Utilizadas 🛠️

* **Smart Contracts:** Solidity, Patrón UUPS Proxy
* **Testing:** Foundry (Cobertura >90%)
* **Entorno Desarrollo Contratos:** Foundry
* **Frontend:** React, JavaScript, CSS, Tailwind
* **Librerías Web3 Frontend:** Ethers.js, Axios (para llamadas a IPFS Gateway).
* **Almacenamiento Descentralizado:** IPFS (Pinata) 
* **Blockchain:** Ethereum (Sepolia Testnet)
* **Wallet:** Metamask (o compatible)

## Demo / Más Información 🔗

Puedes ver más detalles y una demo en la página del proyecto dentro de mi portfolio:
**[https://juanfuente.ovh/gardentech_marketplace/](https://juanfuente.ovh/gardentech_marketplace/)**

## Cómo Empezar (Desarrollo Local) 🚀

1.  **Prerrequisitos:**
    * Node.js, npm/yarn, Git
    * Foundry 
    * Wallet (Metamask).

2.  **Clonar Repositorio:**
    ```bash
    git clone [https://github.com/Juan-Fuente-T/Garden_Tech_Markeplace.git](https://github.com/Juan-Fuente-T/Garden_Tech_Markeplace.git)
    cd Garden_Tech_Markeplace
    ```
3.  **Instalar Dependencias:**
    ```bash
    # Comando/s para instalar dependencias (frontend y contratos)
    npm install
    ```
    `[TU AYUDA AQUÍ: Proporcionar comandos y carpetas]`
4.  **Configurar Variables de Entorno:**
    * Crear archivo `.env`.
    * Añadir variables: `REACT_APP_PINATA_KEY`, `REACT_APP_PINATA_SECRET`(Conexión a Pinata)
    * *Añadir `.env` a `.gitignore`.*
5.  **Iniciar Frontend:**
    ```bash
    # Comando para iniciar el frontend (ej. npm run dev)
    npm start
    ```
6.  Abrir `http://localhost:3000` (o puerto indicado).

## Uso Básico 🖱️

1.  Conecta tu wallet (Metamask) en la red Sepolia.
2.  Ve a "Crear NFT" para mintear tu propio token (necesitarás una imagen y rellenar los datos). Aprueba las transacciones.
3.  Explora el "Marketplace" para ver los NFTs disponibles.
4.  Haz clic en un NFT para ver sus detalles y comprarlo si está a la venta.
5.  En "Mi Perfil" (o similar) puedes ver tus NFTs y gestionar los que tienes a la venta (cambiar precio, retirar).


`![Garden Tech Usage](src/assets/GardenTechImage2.png)`

`![Garden Tech Usage](src/assets/GardenTechImage3.png)`

## Retos y Aprendizajes Clave 🧠

*(Resumen de los puntos de tu portfolio)*
* Implementación del patrón **UUPS Proxy** para contratos actualizables.
* Gestión del almacenamiento descentralizado con **IPFS** para metadatos/imágenes.
* Diseño de lógica compleja para la **compra/venta/gestión** de NFTs.
* Logro de alta **cobertura de tests (>90%)** con Foundry.
* Manejo de **routing y estado** en una DApp React multi-página.

## Licencia 📄

MIT License.

## Contacto 📬

Juan Fuente - [https://www.linkedin.com/in/juan-fuente-dev/] - [https://juanfuente.ovh] - jfuentet@gmail.com