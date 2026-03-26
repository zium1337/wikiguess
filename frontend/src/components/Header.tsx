import { Link } from "react-router-dom";

const Header = () => {
  // mock for now
  // will later implement preventing access via direct URL if not authenticated)
  const isLoggedIn = true;

  return (
    <header className="mb-20">
      <div className="flex justify-between items-center bg-sky-50 rounded-md p-5">
        <Link to="/" className="text-5xl">
          Wikiguess
        </Link>

        <nav className="flex gap-10 items-center">
          <Link to="/game">Game</Link>

          {!isLoggedIn && (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Log in</Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <Link to="/profile">Profile</Link>
              <Link to="/stats">Stats</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
