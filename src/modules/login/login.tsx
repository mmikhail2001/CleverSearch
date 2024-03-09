import { skipToken } from "@reduxjs/toolkit/query";
import { FC, useState } from "react";
import { useLoginMutation } from "@api/userApi";
import { Button, Variants } from "@ui/button/Button";
import { Input } from "@ui/input/input";
import "./login.scss";

interface LoginFormProps {}

export const LoginForm: FC<LoginFormProps> = ({}) => {
  const [loginField, setLogin] = useState("");
  const [passwordField, setPassword] = useState("");

  const [login, { isLoading, isError, error }] = useLoginMutation();

  return (
    <div className="login-form">
      <div className="login-form__inputs">
        <Input
          className={["input-login"]}
          disabled={isLoading}
          type="email"
          placeholder="email"
          value={loginField}
          onChange={(e) => setLogin(e.target.value)}
        ></Input>
        <Input
          className={["input-password"]}
          disabled={isLoading}
          type="password"
          placeholder="password"
          value={passwordField}
          onChange={(e) => setPassword(e.target.value)}
        ></Input>
      </div>
      {/* TODO api call */}
      <Button
        variant={Variants.filled}
        buttonText="Lets go"
        clickHandler={() =>
          login({ email: loginField, password: passwordField })
        }
        disabled={(loginField && passwordField) || isLoading ? false : true}
      ></Button>
    </div>
  );
};
