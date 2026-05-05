// components/common/Table.jsx

const Table = ({ columns = [], children }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#1f2937]">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-5 py-4 text-sm font-semibold text-gray-300 border-b border-gray-800"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;