import { useState } from "react";
import AuthModal from "../auth/AuthModal";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("login");

  return (
    <>
      <div className="flex justify-between items-center px-8 py-4 backdrop-blur-md bg-white/5 border-b border-white/10">
        
        {/* Logo */}
        <h1 className="text-xl font-bold hover:text-pink-400 transition cursor-pointer">
          AuthEngine
        </h1>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setMode("login");
              setOpen(true);
            }}
            className="px-4 py-1.5 rounded-full border border-slate-500 text-slate-300 hover:border-pink-400 hover:text-pink-400 transition"
          >
            Login
          </button>

          <button
            onClick={() => {
              setMode("register");
              setOpen(true);
            }}
            className="px-4 py-1.5 rounded-full bg-pink-600 hover:bg-pink-700 transition text-white font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>

      {open && (
        <AuthModal
          mode={mode}
          setMode={setMode}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;