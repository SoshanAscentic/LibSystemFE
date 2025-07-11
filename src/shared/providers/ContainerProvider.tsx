import React from 'react';
import { Container } from '../container/Container';
import { ContainerContext } from '../hooks/useContainer';

interface ContainerProviderProps {
  container: Container;
  children: React.ReactNode;
}

export const ContainerProvider: React.FC<ContainerProviderProps> = ({
  container,
  children
}) => {
  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  );
};