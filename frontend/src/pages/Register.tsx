import { useState } from "react";
import InputField from "../components/InputField";
import AppButton from "../components/AppButton";

function Register() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");

  return (
    <div className="flex flex-col items-center">
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
      />
      <InputField
        placeholderText="Confirm Password..."
        userInput={passwordConfirmation}
        setUserInput={setPasswordConfirmation}
        width={800}
        height={80}
      />
      <AppButton text="Register account" width={400} height={90} />
    </div>
  );
}
export default Register;
