import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import * as Icons from 'lucide-react-native';
import { Text } from './Text';

interface CategoryBadgeProps extends ViewProps {
  icon: string;
  color: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZES = {
  sm: { container: 28, radius: 8,  iconSize: 14, textSize: 'xs'   as const },
  md: { container: 36, radius: 10, iconSize: 18, textSize: 'sm'   as const },
  lg: { container: 44, radius: 12, iconSize: 22, textSize: 'base' as const },
};

export function CategoryBadge({
  icon,
  color,
  name,
  size = 'md',
  showLabel = true,
  style,
  ...props
}: CategoryBadgeProps) {
  const Icon = (Icons as unknown as Record<string, React.ElementType>)[icon] ?? Icons.Tag;
  const d = SIZES[size];

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]} {...props}>
      <View
        style={{
          width: d.container,
          height: d.container,
          borderRadius: d.radius,
          backgroundColor: color + '22',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={d.iconSize} color={color} strokeWidth={1.75} />
      </View>
      {showLabel && (
        <Text size={d.textSize} weight="medium">{name}</Text>
      )}
    </View>
  );
}
