import type { ReactNode } from 'react';

/**
 * Рендер-функция иконки. Компонент передаёт размер и цвет, согласованные с его
 * темой/вариантом, а вызывающий код решает, какую иконку нарисовать (обычно
 * lucide-react-native). Пример:
 *
 *   <Button label="Дальше" icon={(p) => <ArrowRight {...p} />} />
 */
export type IconRenderer = (props: { size: number; color: string }) => ReactNode;
