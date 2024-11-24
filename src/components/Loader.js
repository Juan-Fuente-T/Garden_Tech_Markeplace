import ClipLoader from "react-spinners/ClipLoader";

const Loader = ({loadingText}) => {
  return (
    // <div className="flex items-center justify-center h-screen">
    <div className="flex items-center justify-center">
      <div className="flex flex-col bg-stone-100 p-8 items-center justify-center border-2 border-stone-800 rounded-md">
        <ClipLoader color="#3498db" size={150} />
        <p className="mt-4 text-2xl font-semibold text-stone-900">{loadingText}</p>
        <p className="mt-2 text-lg text-stone-900">
          This can be take a few moments. Please do not close this page.
        </p>
      </div>
    </div>
  );
};

export default Loader;