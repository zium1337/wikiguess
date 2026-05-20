interface InputFieldProps {
  placeholderText: string;
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  width: number;
  height: number;
  type?: string;
}

function InputField({
  placeholderText,
  userInput,
  setUserInput,
  width,
  height,
  type = "text",
}: InputFieldProps) {
  return (
    <input
      type={type}
      style={{ width: width, height: height }}
      className="bg-white text-3xl placeholder-gray-400 text-sky-950 p-5 rounded-3xl border-6 border-sky-950 text-center m-10 hover:cursor-pointer hover:border-sky-900"
      placeholder={placeholderText}
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
    ></input>
  );
}

export default InputField;
