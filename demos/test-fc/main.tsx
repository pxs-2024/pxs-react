import { createRoot } from 'react-dom/client';
import { useState } from 'react';

function App() {
	const [num, setNum] = useState(0);

	const arr =
		num % 2 === 0
			? [<li key={1}>1</li>, <li key={2}>2</li>, <li key={3}>3</li>]
			: [];

	return (
		<ul
			onClick={() => {
				setNum(num + 1);
			}}
		>
			<>
				<li>1</li>
				<li>2</li>
			</>
			<li>3</li>
			<li>4</li>
			{arr}
		</ul>
	);
}

createRoot(document.getElementById('root')!).render(<App />);
