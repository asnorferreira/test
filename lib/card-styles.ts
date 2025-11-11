export const cardStyles = {
  container:
    "group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl p-0 gap-0",
  imageWrapper: "relative h-64 overflow-hidden",
  image: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
  body: "flex flex-1 flex-col p-6",
  iconWrapper: "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm",
  link:
    "inline-flex h-auto items-center gap-2 p-0 text-base font-semibold text-[#1e3a8a] no-underline transition-colors hover:text-[#1e40af] focus-visible:outline-none focus-visible:ring-0",
} as const
