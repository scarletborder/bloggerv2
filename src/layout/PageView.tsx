import React, { type JSX } from 'react';
import WithNav from './WithNav';
import WithRights from './WithRights';

interface WithPageProps {
  children: React.ReactNode;
}

export default function PageView({ children }: WithPageProps): JSX.Element {
  return (
    <WithRights>
      <WithNav>{children}</WithNav>
    </WithRights>
  );
}
