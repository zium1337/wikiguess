import { Link } from "react-router-dom";
import AppButton from "./AppButton";
import { useAuth } from "../store/AuthContext";

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="mb-20">
      <div className="flex justify-between items-center bg-sky-50 rounded-md p-5">
        <Link to="/" className="text-5xl">
          Wikiguess
        </Link>

        <nav className="flex gap-10 items-center">
          <Link to="/game">Game</Link>

          {!isAuthenticated && (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Log in</Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link to="/profile">Profile</Link>
              <Link to="/stats">Stats</Link>
              <AppButton text="Log out" width={150} height={50} />
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
