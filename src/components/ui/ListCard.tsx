/**
 * ListCard — карточка-список строк. Порт `.listcard` / `.li` / `.lic` / `.arr`.
 * Каждая строка: опц. иконка в плашке слева, лейбл, опц. значение/кастомный
 * правый элемент и стрелка справа. Разделители между строками, последняя — без.
 */
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { tokens, useTheme } from '@/theme';

import type { IconRenderer } from './icon';

export interface ListCardItemDef {
  key: string;
  label: string;
  icon?: IconRenderer;
  /** Вторичный текст справа (перед стрелкой). */
  value?: string;
  /** Кастомный правый элемент (заменяет value). */
  right?: ReactNode;
  onPress?: () => void;
  /** Показывать стрелку. По умолчанию — если есть onPress. */
  showArrow?: boolean;
  /** Опасное действие — лейбл красным (например «Выйти»). */
  danger?: boolean;
}

export interface ListCardProps {
  items: ListCardItemDef[];
  style?: StyleProp<ViewStyle>;
}

export function ListCardRow({
  item,
  last = false,
}: {
  item: ListCardItemDef;
  last?: boolean;
}) {
  const theme = useTheme();
  const showArrow = item.showArrow ?? !!item.onPress;
  const labelColor = item.danger ? theme.colors.danger : theme.colors.text;
  const iconColor = item.danger ? theme.colors.danger : theme.colors.brandPrimary;

  const content = (
    <>
      {item.icon ? (
        <View style={[styles.iconBox, { backgroundColor: theme.colors.surface2 }]}>
          {item.icon({ size: 20, color: iconColor })}
        </View>
      ) : null}
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
        {item.label}
      </Text>
      {item.right ?? (
        item.value ? (
          <Text style={[styles.value, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {item.value}
          </Text>
        ) : null
      )}
      {showArrow ? <ChevronRight size={20} color={theme.colors.textFaint} /> : null}
    </>
  );

  const rowStyle = [
    styles.row,
    !last && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  ];

  if (item.onPress) {
    return (
      <Pressable
        onPress={item.onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          rowStyle,
          pressed && { backgroundColor: theme.colors.surface2 },
        ]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={rowStyle}>{content}</View>;
}

export function ListCard({ items, style }: ListCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.card,
        },
        style,
      ]}
    >
      {items.map((item, i) => (
        <ListCardRow key={item.key} item={item} last={i === items.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, minHeight: 44 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontFamily: tokens.fonts.uiMedium, fontSize: 15 },
  value: { fontFamily: tokens.fonts.uiRegular, fontSize: 14 },
});
