import React, { FC, useState } from "react";
import { Button, Variants } from "../../ui/button/Button";

// https://react-select.com/components
// https://www.youtube.com/watch?v=3u_ulMvTYZI&t=269s&ab_channel=MonsterlessonsAcademy

interface LoginFormProps {}

export const LoginForm: FC<LoginFormProps> = ({}) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div>
      <div>
        <input
          type="email"
          placeholder="email"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        ></input>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
      </div>
      {/* TODO api call */}
      <Button
        variant={Variants.filled}
        buttonText="Lets go"
        clickHandler={() => console.log(login, " ", password)}
        disabled={login && password ? false : true}
      ></Button>
    </div>
  );
};
