// Template and design system types

export interface Template {
  id: string
  name: string
  category: 'tech' | 'creative' | 'business' | 'academic' | 'freelancer'
  components: Component[]
  theme: Theme
  layout: Layout
  metadata: TemplateMetadata
}

export interface TemplateMetadata {
  preview: string
  description: string
  bestFor: string[]
  industries: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  features: string[]
}

export interface Component {
  id: string
  type: ComponentType
  required: boolean
  customizable: boolean
  variants: ComponentVariant[]
  defaultVariant: string
}

export type ComponentType =
  | 'hero'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'contact'
  | 'testimonials'
  | 'blog'
  | 'certifications'
  | 'awards'

export interface ComponentVariant {
  id: string
  name: string
  preview?: string
}

export interface Theme {
  colors: ColorScheme
  typography: Typography
  spacing: SpacingSystem
  darkMode: boolean
  animations: AnimationPreferences
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  muted: string
  border: string
  error: string
  success: string
  warning: string
}

export interface Typography {
  headingFont: string
  bodyFont: string
  codeFont?: string
  scale: TypographyScale
}

export interface TypographyScale {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
}

export interface SpacingSystem {
  unit: number // base spacing unit in px
  scale: number[] // multipliers for spacing
}

export interface AnimationPreferences {
  enabled: boolean
  speed: 'slow' | 'normal' | 'fast'
  easing: string
  entranceAnimations: boolean
  scrollAnimations: boolean
}

export interface Layout {
  type: 'single-page' | 'multi-page'
  navigation: NavigationConfig
  sections: SectionConfig[]
}

export interface NavigationConfig {
  position: 'top' | 'side' | 'bottom'
  style: 'minimal' | 'standard' | 'prominent'
  sticky: boolean
  items: NavigationItem[]
}

export interface NavigationItem {
  label: string
  href: string
  icon?: string
}

export interface SectionConfig {
  id: string
  componentType: ComponentType
  order: number
  enabled: boolean
  customization?: Record<string, any>
}

export interface Design {
  templateId: string
  theme: Theme
  layout: Layout
  customization: Customization
}

export interface Customization {
  colors?: Partial<ColorScheme>
  typography?: Partial<Typography>
  spacing?: Partial<SpacingSystem>
  animations?: Partial<AnimationPreferences>
  componentSettings?: Record<string, ComponentCustomization>
}

export interface ComponentCustomization {
  variant?: string
  enabled?: boolean
  customStyles?: Record<string, any>
  customContent?: Record<string, any>
}

export interface DesignContext {
  currentTemplate: Template
  currentTheme: Theme
  currentLayout: Layout
  userProfile: any
  viewport: Viewport
}

export interface Viewport {
  width: number
  height: number
  device: 'mobile' | 'tablet' | 'desktop'
}

export interface Intent {
  action: 'modify' | 'add' | 'remove' | 'rearrange' | 'suggest'
  target: 'layout' | 'color' | 'typography' | 'spacing' | 'content' | 'component'
  modifier?: string
  confidence: number
}

export interface DesignAction {
  type: 'css_change' | 'component_update' | 'layout_shift' | 'content_edit'
  changes: Change[]
  preview: string
  canUndo: boolean
}

export interface Change {
  path: string
  oldValue: any
  newValue: any
  timestamp: string
}

export interface Suggestion {
  id: string
  type: 'improvement' | 'warning' | 'tip'
  message: string
  action?: DesignAction
  priority: 'low' | 'medium' | 'high'
}

export interface RenderedSite {
  html: string
  css: string
  js: string
  assets: Asset[]
  metadata: SiteMetadata
}

export interface Asset {
  type: 'image' | 'font' | 'icon'
  path: string
  url: string
  optimized: boolean
}

export interface SiteMetadata {
  title: string
  description: string
  author: string
  keywords: string[]
  ogImage?: string
  favicon?: string
}

export interface PreviewData {
  html: string
  css: string
  viewport: Viewport
  interactive: boolean
}
