import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { useAuth } from "../store/AuthContext";
import { useLoading } from "../store/LoadingContext";
import AppButton from "../components/AppButton";
import { AuthError } from "../models/AuthModels";
import * as authApi from "../service/AuthService";

function Profile() {
  const { user, logout } = useAuth();
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");

  const validatePasswordForm = (): string | null => {
    if (
      !oldPassword.trim() ||
      !newPassword.trim() ||
      !passwordConfirmation.trim()
    ) {
      return "Please fill in all fields.";
    }
    if (newPassword !== passwordConfirmation) {
      return "New passwords do not match.";
    }
    if (newPassword === oldPassword) {
      return "New password must differ from the current one.";
    }
    return null;
  };

  const changePassword = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const validationError = validatePasswordForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword(
        { old_password: oldPassword, new_password: newPassword },
        user!.user_id,
      );
      alert("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      if (err instanceof AuthError) {
        alert(err.message);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account :( ? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await authApi.deleteAccount(user!.user_id);
      logout();
      navigate("/");
    } catch (err) {
      if (err instanceof AuthError) {
        alert(err.message);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl mb-10">Welcome {user?.username}!</div>
      <div className="text-4xl">You can manage your account here:</div>

      <form
        onSubmit={changePassword}
        className="flex flex-col items-center mt-30 mb-30"
      >
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
      </form>

      <div className="text-3xl">Delete Account</div>
      <AppButton
        text="Delete Account"
        width={500}
        height={80}
        onClick={deleteAccount}
      />
    </div>
  );
}
export default Profile;
