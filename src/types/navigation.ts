import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type TabParamList = {
  Dashboard: undefined;
  Lançamentos: undefined;
  Cartão: undefined;
  Orçamentos: undefined;
  Metas: undefined;
  Relatórios: undefined;
  Categorias: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<
  TabParamList,
  T
>;
