interface ButtonProps {
  text: string;
  onClick: () => void;
  secondary?: boolean;
}

export default function Button({ text, onClick, secondary }: ButtonProps) {
  if (secondary) {
    return (
      <button
        onClick={onClick}
        className="p-2 rounded-lg bg-secondary-100 hover:opacity-70 text-white"
      >
        {text}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-black"
    >
      {text}
    </button>
  );
}
