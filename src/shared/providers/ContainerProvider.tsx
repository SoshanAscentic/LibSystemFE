import React from 'react';
import { ContainerContext } from '../hooks/useContainer';
import { Container } from '../container/Container';

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