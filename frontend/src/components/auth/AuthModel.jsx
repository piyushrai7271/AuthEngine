import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthModal = ({ mode, setMode, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-[#1f2937] p-6 rounded w-96 relative">

        <button
          className="absolute top-2 right-3"
          onClick={onClose}
        >
          ✕
        </button>

        {mode === "login" ? (
          <LoginForm switchMode={() => setMode("register")} />
        ) : (
          <RegisterForm switchMode={() => setMode("login")} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;