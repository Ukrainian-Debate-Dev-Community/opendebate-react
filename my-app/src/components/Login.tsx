import { Form } from "./Form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { setUser } from "../store/slices/UserSlices";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    const user = await loginUser(credentials);
    dispatch(setUser(user));
    navigate("/");
  };

  return <Form title="Sign in" handleClick={handleLogin} />;
};
