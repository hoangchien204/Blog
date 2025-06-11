// LayoutWithTab.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import TabNavigator from '../navigators/TabNavigator.tsx';

const LayoutWithTab = () => {
  return (
    <>
    
      <Outlet />
    <TabNavigator />
    </>
  );
};

export default LayoutWithTab;
