import { createContext, type ReactNode, useContext } from 'react';
import type { IGetHealthUseCase } from '../../../interfaces/core/application/i-get-health.use-case';

export interface AppDependencies {
  readonly getHealthUseCase: IGetHealthUseCase;
}

const AppDependenciesContext = createContext<AppDependencies | null>(null);

interface AppDependenciesProviderProps {
  readonly dependencies: AppDependencies;
  readonly children: ReactNode;
}

export function AppDependenciesProvider({ dependencies, children }: AppDependenciesProviderProps) {
  return (
    <AppDependenciesContext.Provider value={dependencies}>
      {children}
    </AppDependenciesContext.Provider>
  );
}

export function useDependencies(): AppDependencies {
  const dependencies = useContext(AppDependenciesContext);
  if (dependencies === null) {
    throw new Error('useDependencies fora do AppDependenciesProvider');
  }
  return dependencies;
}
