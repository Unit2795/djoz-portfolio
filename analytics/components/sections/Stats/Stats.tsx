import StatCard from "@/components/StatCard/StatCard";

const Stats = ({ stats }: { stats: Record<string, number> }) => {
	return (
		<section aria-labelledby="stats-heading" className="space-y-4">
			<h2 id="stats-heading" className="text-lg font-medium">
				Statistics
			</h2>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				{Object.entries(stats).map(([key, value]) => (
					<StatCard key={key} title={key.charAt(0).toUpperCase() + key.slice(1)} value={value} />
				))}
			</div>
		</section>
	);
};

export default Stats;
