
import { FoodCategory } from './types';
import { fruechteMap } from './fruechteMap';
import { gemueseMap } from './gemueseMap';
import { fleischMap } from './fleischMap';
import { fischMap } from './fischMap';
import { milchprodukteMap } from './milchprodukteMap';
import { getreideMap } from './getreideMap';
import { huelsenfruechteMap } from './huelsenfruechteMap';
import { nuesseMap } from './nuesseMap';
import { gewuerzeMap } from './gewuerzeMap';
import { getraenkeMap } from './getraenkeMap';
import { suessigkeitenMap } from './suessigkeitenMap';
import { konservenMap } from './konservenMap';
import { tiefkuehlwareMap } from './tiefkuehlwareMap';

// Combine all category maps into one complete map
export const foodCategoryMap: Record<string, FoodCategory> = {
  ...fruechteMap,
  ...gemueseMap,
  ...fleischMap,
  ...fischMap,
  ...milchprodukteMap,
  ...getreideMap,
  ...huelsenfruechteMap,
  ...nuesseMap,
  ...gewuerzeMap,
  ...getraenkeMap,
  ...suessigkeitenMap,
  ...konservenMap,
  ...tiefkuehlwareMap
};
