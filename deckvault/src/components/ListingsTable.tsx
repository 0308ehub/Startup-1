export default function ListingsTable() {
	return (
		<table className="w-full text-sm border">
			<thead>
				<tr className="bg-gray-50">
					<th className="p-2 text-left">CardSet</th>
					<th className="p-2 text-left">Price</th>
					<th className="p-2 text-left">Qty</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td className="p-2">Example</td>
					<td className="p-2">$1.00</td>
					<td className="p-2">1</td>
				</tr>
			</tbody>
		</table>
	);
}


