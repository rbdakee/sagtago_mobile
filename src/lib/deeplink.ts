/**
 * Deep-link «Открыть в 2GIS» (BP-04 / C-08 / C-12). Работает независимо от
 * выбранного map-SDK. Открываем веб-ссылку 2GIS — она сама уводит в приложение,
 * если оно установлено.
 */
import { Linking } from 'react-native';

import type { Geo } from '@/domain';

export async function open2gis(geo: Geo): Promise<void> {
  const url = `https://2gis.kz/geo/${geo.lng},${geo.lat}`;
  try {
    await Linking.openURL(url);
  } catch {
    // намеренно тихо: карта не должна ронять флоу
  }
}
