import {
	StrictMode
} from "react";
import {
	createRoot
} from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
	ScrollSpyProvider
} from "@/components/Navbar/ScrollSpyProvider.tsx";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot( document.getElementById( "root" )! ).render(
	<StrictMode>
		<ScrollSpyProvider>
			<App />
		</ScrollSpyProvider>
	</StrictMode>,
);
