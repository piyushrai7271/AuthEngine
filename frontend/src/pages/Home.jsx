import Navbar from "../components/layout/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center h-[85vh] text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 hover:text-pink-400 transition duration-300">
          Welcome To AuthEngine
        </h1>

        <p className="text-slate-400 text-sm max-w-xl hover:text-pink-300 transition duration-300">
          Secure authentication system with OTP, OAuth, and role-based access
        </p>
      </div>
    </div>
  );
};

export default Home;
