/**
 * Button Component - Examples and Usage Guide
 *
 * This file contains examples of how to use the Button component
 * with all its variants, sizes, and features.
 */

import { Button } from '@/components/ui/button';
import {
    Plus,
    Edit,
    Trash2,
    Download,
    Upload,
    Save,
    X,
    Check,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react';

export function ButtonExamples() {
    return (
        <div className="space-y-8 p-8">
            {/* Basic Variants */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Variants</h2>
                <div className="flex flex-wrap gap-4">
                    <Button variant="default">Default</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                </div>
            </section>

            {/* Sizes */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Sizes</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                </div>
            </section>

            {/* Icon Buttons */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Icon Buttons</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <Button size="icon" variant="default">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon-sm" variant="ghost">
                        <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon-lg" variant="secondary">
                        <Save className="h-5 w-5" />
                    </Button>
                </div>
            </section>

            {/* Left Icon */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">With Left Icon</h2>
                <div className="flex flex-wrap gap-4">
                    <Button leftIcon={<Plus />}>
                        Criar Novo
                    </Button>
                    <Button variant="outline" leftIcon={<Edit />}>
                        Editar
                    </Button>
                    <Button variant="destructive" leftIcon={<Trash2 />}>
                        Excluir
                    </Button>
                    <Button variant="secondary" leftIcon={<Download />}>
                        Download
                    </Button>
                </div>
            </section>

            {/* Right Icon */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">With Right Icon</h2>
                <div className="flex flex-wrap gap-4">
                    <Button rightIcon={<ArrowRight />}>
                        Avançar
                    </Button>
                    <Button variant="outline" rightIcon={<Upload />}>
                        Upload
                    </Button>
                    <Button variant="success" rightIcon={<Check />}>
                        Confirmar
                    </Button>
                </div>
            </section>

            {/* Loading State */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Loading State</h2>
                <div className="flex flex-wrap gap-4">
                    <Button loading>
                        Carregando...
                    </Button>
                    <Button variant="outline" loading>
                        Processando
                    </Button>
                    <Button variant="destructive" loading size="sm">
                        Excluindo
                    </Button>
                    <Button variant="success" loading size="lg">
                        Salvando
                    </Button>
                </div>
            </section>

            {/* Disabled State */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Disabled State</h2>
                <div className="flex flex-wrap gap-4">
                    <Button disabled>Disabled</Button>
                    <Button variant="outline" disabled leftIcon={<Edit />}>
                        Disabled with Icon
                    </Button>
                    <Button variant="destructive" disabled>
                        Disabled Destructive
                    </Button>
                </div>
            </section>

            {/* Common Use Cases */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Common Use Cases</h2>

                {/* Modal Actions */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Modal Actions</h3>
                    <div className="flex gap-2">
                        <Button variant="outline">Cancelar</Button>
                        <Button>Salvar</Button>
                    </div>
                </div>

                {/* Table Actions */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Table Actions</h3>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" leftIcon={<Edit />}>
                            Editar
                        </Button>
                        <Button variant="ghost" size="sm" leftIcon={<Trash2 />}>
                            Excluir
                        </Button>
                    </div>
                </div>

                {/* Form Submit */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Form Submit</h3>
                    <Button type="submit" loading={false} leftIcon={<Save />}>
                        Salvar Alterações
                    </Button>
                </div>

                {/* Back Navigation */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Back Navigation</h3>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft />
                    </Button>
                </div>
            </section>

            {/* Code Examples */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Code Examples</h2>
                <div className="space-y-4 rounded-lg bg-muted p-4">
                    <pre className="text-sm">
{`// Basic Button
<Button>Click me</Button>

// With Variant
<Button variant="destructive">Delete</Button>

// With Left Icon
<Button leftIcon={<Plus />}>Create New</Button>

// With Right Icon
<Button rightIcon={<ArrowRight />}>Next</Button>

// Loading State
<Button loading>Saving...</Button>

// Icon Only
<Button size="icon">
  <Edit className="h-4 w-4" />
</Button>

// Disabled
<Button disabled>Disabled</Button>

// With onClick Handler
<Button onClick={() => console.log('Clicked')}>
  Click me
</Button>

// Form Submit
<Button type="submit" loading={processing}>
  Submit Form
</Button>`}
                    </pre>
                </div>
            </section>
        </div>
    );
}

/**
 * Props Reference:
 *
 * variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning"
 * size?: "default" | "sm" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg"
 * loading?: boolean
 * leftIcon?: React.ReactNode
 * rightIcon?: React.ReactNode
 * disabled?: boolean
 * asChild?: boolean
 * ...all standard button HTML attributes
 */
