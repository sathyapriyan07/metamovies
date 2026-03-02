// MetaMovies+ Design System
// Premium OTT Design Tokens & Patterns

export const designTokens = {
  // Colors
  colors: {
    primary: 'bg-yellow-500',
    primaryHover: 'bg-yellow-400',
    primaryText: 'text-yellow-500',
    background: 'bg-black',
    surface: 'bg-zinc-900',
    surface2: 'bg-zinc-800',
    border: 'border-zinc-800',
    borderHover: 'border-zinc-700',
    textPrimary: 'text-white',
    textMuted: 'text-zinc-400',
    textLabel: 'text-zinc-500',
  },

  // Typography
  typography: {
    pageTitle: 'text-2xl font-semibold',
    sectionTitle: 'text-lg font-semibold',
    cardTitle: 'text-sm font-medium',
    bodyText: 'text-sm text-zinc-400',
    smallLabel: 'text-xs text-zinc-500',
  },

  // Spacing
  spacing: {
    sectionSpacing: 'py-6',
    cardPadding: 'p-4 sm:p-6',
    sectionGap: 'space-y-6',
    cardGap: 'gap-4',
    cardGapLarge: 'gap-6',
  },

  // Layout
  layout: {
    pageContainer: 'min-h-screen bg-black overflow-x-hidden',
    contentContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6',
    card: 'bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 transition-all duration-200 hover:border-zinc-700',
    posterGrid: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
  },

  // Components
  components: {
    primaryButton: 'bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl w-full sm:w-auto hover:bg-yellow-400 transition',
    secondaryButton: 'bg-zinc-800 border border-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-700 transition',
    dangerButton: 'bg-red-500 text-white px-4 py-2 rounded-lg text-xs hover:bg-red-600 transition',
    input: 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition',
    select: 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition',
  },

  // Hero
  hero: {
    container: 'relative h-[70vh] flex items-end overflow-hidden',
    gradient: 'absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent',
    content: 'relative z-10 px-4 pb-8 space-y-4 max-w-xl',
  },

  // Tabs
  tabs: {
    container: 'flex gap-6 border-b border-zinc-800 overflow-x-auto scrollbar-hide',
    active: 'text-yellow-500 border-b-2 border-yellow-500 pb-2 whitespace-nowrap',
    inactive: 'text-zinc-400 pb-2 whitespace-nowrap hover:text-zinc-300 transition',
  },
};

export default designTokens;
