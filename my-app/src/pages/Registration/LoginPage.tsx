import { Link } from "react-router-dom";
import { Login } from "../../components/Login";

export const LoginPage = () => {
  return (
    <>
      <h1>Login</h1>
      <Login />
      <p>
        or <Link to="/register">register</Link>
      </p>
    </>
  );
};
