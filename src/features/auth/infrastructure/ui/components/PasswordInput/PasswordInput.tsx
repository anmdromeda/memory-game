import { useState } from "react";
import { Input, type InputProps } from "../../../../../../shared/infrastructure/ui/components/Input";
import { EyeIconSvg } from "../../../../../../shared/infrastructure/ui/components/SvgIcons/EyeIconSvg";
import { EyeIconClosedSvg } from "../../../../../../shared/infrastructure/ui/components/SvgIcons/EyeIconClosed";

interface PasswordInputProps extends InputProps {
  label: string;
}

function PasswordInput({ defaultValue, error, disabled, label, name }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      label={label}
      name={name}
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      defaultValue={defaultValue}
      error={error}
      disabled={disabled}
      icon={showPassword ? <EyeIconClosedSvg /> : <EyeIconSvg />}
      onIconClick={() => setShowPassword((value) => !value)}
    />
  );
}

export default PasswordInput;
