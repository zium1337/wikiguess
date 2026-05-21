import { useState } from "react";
import AppButton from "../components/AppButton";
import InputField from "../components/InputField";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../store/LoadingContext";
import { mockLogin } from "../mocks/authMocks";
import { AuthError } from "../models/AuthModels";

function Login() {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const validateForm = (): string | null => {
    if (!email.trim() || !password.trim()) {
      return "Please fill in all fields.";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  const submit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    // mock fetching data
    setIsLoading(true);

    try {
      await mockLogin({ email, password });
      navigate("/");
    } catch (err) {
      if (err instanceof AuthError) {
        alert(err.message);
      } else {
        alert("Something went wrong :( please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col items-center">
      <div className="text-4xl mb-30">Log in to your account!</div>

      <InputField
        placeholderText="Email address..."
        userInput={email}
        setUserInput={setEmail}
        width={800}
        height={80}
      />
      <InputField
        placeholderText="Password..."
        userInput={password}
        setUserInput={setPassword}
        width={800}
        height={80}
      />

      <AppButton text="Log in" width={400} height={90} />
    </form>
  );
}
export default Login;
