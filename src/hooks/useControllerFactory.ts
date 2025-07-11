import { useContainer } from '../shared/hooks/useContainer';
import { ControllerFactory } from '../application/factories/ControllerFactory';

export const useControllerFactory = (): ControllerFactory => {
  const container = useContainer();
  return new ControllerFactory(container);
};