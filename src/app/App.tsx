import { RootLayout } from "@/layouts/RootLayout";
import AppRouter from "@/router/AppRouter";

export default function App() {
	return (
		<RootLayout>
			<AppRouter />
		</RootLayout>
	);
}
