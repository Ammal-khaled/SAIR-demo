import logoImg from "../../assets/LOGO.png";

export default function Logo() {
  return (
    <img
      src={logoImg}
      alt="logo"
      className="h-24 w-auto object-contain"
    />
  );
}