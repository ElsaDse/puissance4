type Props = {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({ label, type, value, placeholder, onChange }: Props) {
  return (
    <div className="login-input">
      <label>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={onChange} />
    </div>
  );
}
