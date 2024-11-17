import InfoSection from "./InfoSection";

function Footer() {
    return (
      <div className="w-full bg-gray-300 mt-60 fixed bottom-0 left-0 z-20">
        {/* InfoSection integrado y ocupando el ancho completo */}
        <div className="w-full">
          <InfoSection />
        </div>
        {/* Footer real, con texto */}
        <footer className="flex justify-center items-center w-full p-4 bg-gray-400">
          Made with ❤️ by Juan Fuente
        </footer>
      </div>
    );
  }
  
  export default Footer;