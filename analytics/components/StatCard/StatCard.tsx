import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const StatCard = ({ title, value }: { title: string; value: number }) => {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-semibold">{value.toLocaleString()}</div>
			</CardContent>
		</Card>
	);
};

export default StatCard;
