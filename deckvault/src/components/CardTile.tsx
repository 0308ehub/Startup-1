export default function CardTile({ name, type }: { name: string; type: string }) {
	return (
		<div className="border rounded p-3">
			<div className="font-medium">{name}</div>
			<div className="text-sm text-gray-500">{type}</div>
		</div>
	);
}


