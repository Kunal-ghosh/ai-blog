/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-white',
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'text-white',
    'text-black',
    'text-gray-800',
    'text-gray-600',
    'text-blue-600',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}






