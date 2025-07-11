import { useContext, createContext } from 'react';
import { Container } from '../container/Container';

export const ContainerContext = createContext<Container | null>(null);

export const useContainer = (): Container => {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error('useContainer must be used within ContainerProvider');
  }
  return container;
};