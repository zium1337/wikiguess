import { Link } from "react-router-dom";

const Header = () => {
  // mock for now
  const isLoggedIn = true;

  return (
    <header>
      <div className="flex justify-between items-center">
        <Link to="/">Wikiguess</Link>

        <nav className="flex gap-5">
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
