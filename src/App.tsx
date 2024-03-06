import React, { useState } from "react";
import { Button, Variants } from "./ui/button/Button";
import { Checkbox } from "./ui/checkbox/Checkbox";
import { FileShow } from "./ui/file_show/fileShow";
import { SelectorMulti } from "./ui/selectorMulti/selectorMulti";

function App() {
  const [disabled, setDisabled] = useState(false);
  const [checked, setChecked] = useState(false);
  return (
    <div className="App">
      <Button
        disabled={disabled}
        buttonText={"Уф"}
        variant={Variants.filled}
        clickHandler={() => setDisabled(!disabled)}
      ></Button>
      <Button
        disabled={false}
        variant={Variants.not_filled}
        buttonText={"Уф"}
        clickHandler={() => setDisabled(!disabled)}
      ></Button>
      <Checkbox
        disabled={false}
        isChecked={checked}
        clickHandler={() => setChecked(!checked)}
      ></Checkbox>
      <FileShow
        iconSrc="/mnt/c/Users/Inkas/Pictures/test.jpg"
        altText="ara"
        filename="Ararat"
        size="5gm"
        date="22.22.2222"
      ></FileShow>
      <SelectorMulti></SelectorMulti>
    </div>
  );
}

export default App;
