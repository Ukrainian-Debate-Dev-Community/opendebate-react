import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../../store/slices/UserSlices";
import { useAuth } from "../../hooks/use-auth";

export const HomePage = () => {
  const dispatch = useDispatch();
  const { isAuth, email } = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <h1>Home</h1>
      <p>{email}</p>
      <button onClick={() => dispatch(removeUser())}>Log out</button>
      <p>
        create acconut <Link to="/register">here</Link>
      </p>
    </>
  );
};
