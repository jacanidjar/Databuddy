'use client';

import { ConnectionCard } from './connection-card';
import { EmptyState } from './empty-state';

interface DatabaseConnection {
	id: string;
	name: string;
	type: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

interface ConnectionsListProps {
	connections: DatabaseConnection[];
	isLoading: boolean;
	onEdit: (connection: DatabaseConnection) => void;
	onDelete: (connection: DatabaseConnection) => void;
	onCreate: () => void;
}

export function ConnectionsList({
	connections,
	isLoading,
	onEdit,
	onDelete,
	onCreate,
}: ConnectionsListProps) {
	if (isLoading) {
		return null; // Skeleton is handled by parent
	}

	if (connections.length === 0) {
		return <EmptyState onCreateConnection={onCreate} />;
	}

	return (
		<div className="space-y-3">
			{connections.map((connection) => (
				<ConnectionCard
					connection={connection}
					key={connection.id}
					onDelete={() => onDelete(connection)}
					onEdit={() => onEdit(connection)}
				/>
			))}
		</div>
	);
}
