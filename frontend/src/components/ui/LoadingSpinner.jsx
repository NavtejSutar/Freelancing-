export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-12 w-12', lg: 'h-16 w-16' };
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizes[size]}`} />
    </div>
  );
}
