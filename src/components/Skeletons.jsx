export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-gray-200 rounded flex-1" />
        <div className="h-8 bg-gray-200 rounded w-12" />
      </div>
    </div>
  </div>
);

export const ProductsGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-32" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-24" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-28" />
    </td>
    <td className="px-6 py-4">
      <div className="h-8 bg-gray-200 rounded w-20" />
    </td>
  </tr>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <table className="w-full">
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </tbody>
  </table>
);

export const FormSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-20" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
    <div className="h-10 bg-gray-200 rounded w-28" />
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-48" />
    <ProductsGridSkeleton count={8} />
  </div>
);
