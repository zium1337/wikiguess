import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import AppButton from "../components/AppButton";
import { AuthError } from "../models/AuthModels";
import { useLoading } from "../store/LoadingContext";
import { useAuth } from "../store/AuthContext";

function Register() {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");

  const { setIsLoading } = useLoading();
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): string | null => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !passwordConfirmation.trim()
    ) {
      return "Please fill in all fields.";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address.";
    }
    if (password !== passwordConfirmation) {
      return "Passwords do not match.";
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

    setIsLoading(true);

    try {
      await register({ username, email, password });
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
      <div className="text-4xl mb-30">
        Register now to gain access to personal and global stats!
      </div>

      <InputField
        placeholderText="Username..."
        userInput={username}
        setUserInput={setUsername}
        width={800}
        height={80}
      />
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
        type="password"
      />
      <InputField
        placeholderText="Confirm Password..."
        userInput={passwordConfirmation}
        setUserInput={setPasswordConfirmation}
        width={800}
        height={80}
        type="password"
      />

      <AppButton text="Register account" width={400} height={90} />
    </form>
  );
}
export default Register;
