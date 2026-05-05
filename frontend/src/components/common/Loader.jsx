// components/common/Loader.jsx

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="text-gray-400 text-sm animate-pulse">
        {text}
      </div>
    </div>
  );
};

export default Loader;