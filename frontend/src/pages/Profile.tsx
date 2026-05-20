import { useState } from "react";
import InputField from "../components/InputField";
import { useAuth } from "../store/AuthContext";
import AppButton from "../components/AppButton";

function Profile() {
  const { user } = useAuth();

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");

  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl mb-10">Welcome {user?.username}!</div>
      <div className="text-4xl">You can manage your account here:</div>

      <div className="flex flex-col items-center mt-30 mb-30">
        <div className="text-3xl">Change Password</div>
        <InputField
          placeholderText="Current password..."
          userInput={oldPassword}
          setUserInput={setOldPassword}
          width={800}
          height={80}
          type="password"
        />
        <InputField
          placeholderText="New password..."
          userInput={newPassword}
          setUserInput={setNewPassword}
          width={800}
          height={80}
          type="password"
        />
        <InputField
          placeholderText="Confirm new password..."
          userInput={passwordConfirmation}
          setUserInput={setPasswordConfirmation}
          width={800}
          height={80}
          type="password"
        />
        <AppButton text="Change Password" width={500} height={80} />
      </div>
      <div className="text-3xl">Delete Account</div>
      <AppButton text="Delete Account" width={500} height={80} />
    </div>
  );
}
export default Profile;
