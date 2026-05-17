import { Link } from "react-router-dom";
import { SignUp } from "../../components/SignUp";

export const RegistrPage = () => {
  return (
    <>
      <h1>Registration</h1>
      <SignUp />

      <p>
        Alreade have to account? <Link to="/login">Sign in</Link>
      </p>
    </>
  );
};
