import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface SearchContextValue {
  search: string;
  setSearch: (termo: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('');
  const valor = useMemo<SearchContextValue>(() => ({ search, setSearch }), [search]);
  return <SearchContext.Provider value={valor}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
  const contexto = useContext(SearchContext);
  if (!contexto) {
    throw new Error('useSearch deve ser usado dentro de SearchProvider');
  }
  return contexto;
}
