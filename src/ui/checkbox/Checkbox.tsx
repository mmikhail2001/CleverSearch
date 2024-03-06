import React, { FC } from "react";

interface CheckboxProps {
  isChecked: boolean;
  clickHandler: (e: React.MouseEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export const Checkbox: FC<CheckboxProps> = ({
  clickHandler,
  isChecked,
  disabled,
}) => {
  let clkHandler: (e: React.MouseEvent<HTMLInputElement>) => void;
  if (!disabled) {
    clkHandler = clickHandler;
  } else {
    clkHandler = () => {};
  }

  return (
    <input
      type="checkbox"
      checked={isChecked}
      disabled={disabled}
      className={disabled ? "disabled-checkbox" : "checkbox"}
      onClick={clickHandler}
    ></input>
  );
};
