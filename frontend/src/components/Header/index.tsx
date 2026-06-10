import frostLogo from "../../assets/frost.png";

function Header() {
  return (
    <nav className="bg-info navbar navbar-expand-lg navbar-light shadow-sm">
      <div className="container-fluid px-4">
        <a className="navbar-brand" href="#home">
          <img
            style={{ width: "150px" }}
            src={frostLogo}
            alt="Permafrost"
          />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarPermafrost"
          aria-controls="navbarPermafrost"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarPermafrost">
          <form className="d-flex ms-auto mt-2 mt-lg-0" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button className="btn btn-primary text-light" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Header;
