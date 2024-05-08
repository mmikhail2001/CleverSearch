import CSS from 'csstype';
import React, { FC } from 'react';


export interface PageProps {
  children: React.ReactNode,
  style: CSS.Properties,
}

const Page: FC<PageProps> = React.memo(function page({ children, style }: PageProps) {
  const internalStyle = {
    ...style,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return <div style={internalStyle}>{children}</div>;
});

export default Page;
