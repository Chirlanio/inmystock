import * as icons from 'lucide-react';

interface LucideIconProps extends icons.LucideProps {
    name: keyof typeof icons;
}

export function LucideIcon({ name, ...props }: LucideIconProps) {
    const Icon = icons[name];

    if (!Icon) {
        return null;
    }

    return <Icon {...props} />;
}
