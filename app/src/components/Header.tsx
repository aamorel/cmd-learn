interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="w-full flex items-center justify-center p-2 space-x-4 border-b">
      <img src="./logo.svg" alt="logo" className="w-20 h-20" />
      <h1 className="text-3xl">{title}</h1>
    </div>
  );
}
