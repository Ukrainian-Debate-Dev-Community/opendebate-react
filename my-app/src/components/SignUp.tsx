import { Form } from "./Form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { setUser } from "../store/slices/UserSlices";

export const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (credentials: {
    email: string;
    password: string;
  }) => {
    const user = await registerUser(credentials);
    dispatch(setUser(user));
    navigate("/");
  };

  return <Form title="Register" handleClick={handleRegister} />;
};
