import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthModal = ({ mode, setMode, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1f2937] w-full max-w-md rounded-xl p-6 pt-15 relative">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-5 text-gray-400 text-xl hover:text-pink-200"
        >
          ✕
        </button>

        {/* SWITCH */}
        {mode === "login" ? (
          <LoginForm switchToRegister={() => setMode("register")} />
        ) : (
          <RegisterForm switchToLogin={() => setMode("login")} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
