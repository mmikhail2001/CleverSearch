import React, { FC } from "react";
import { ActionMeta, MultiValue, SingleValue } from "react-select";
import AsyncSelect from "react-select/async";

export interface Option {
  label: string;
  value: string;
  color: string;
}

interface SelectorAsyncProps {
  loadFunction: (inputValue: string) => Promise<Option[]>;
  isMulti?: boolean;
  defaultOptions: boolean;
  cacheOptions: boolean;
  onChange: (
    e: SingleValue<Option> | MultiValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => void;
}

const promiseOptions = (inputValue: string) =>
  new Promise<Option[]>((resolve) => {
    setTimeout(() => {
      //   resolve(filterColors(inputValue));
      resolve([
        { value: "value", label: "label", color: "black" },
        { value: "value1", label: "labe1l", color: "black1" },
      ]);
    }, 1000);
  });
export const SelectorAsync: FC<SelectorAsyncProps> = ({
  loadFunction,
  isMulti,
  defaultOptions,
  cacheOptions,
  onChange,
}) => {
  return (
    <AsyncSelect
      onChange={onChange}
      cacheOptions={cacheOptions}
      loadOptions={loadFunction}
      defaultOptions={defaultOptions ? true : true}
      isMulti={isMulti}
    ></AsyncSelect>
  );

  return (
    <AsyncSelect cacheOptions defaultOptions loadOptions={promiseOptions} />
  );
};
