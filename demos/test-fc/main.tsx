import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';

function Child() {
	const [num, updateNum] = useState(0);

	useEffect(() => {
		console.log('>>>>child mount');
		return () => {
			console.log('>>>>child unmount');
		};
	}, []);

	return <div>2</div>;
}

function App() {
	const [num, setNum] = useState(0);
	useEffect(() => {
		console.log('>>>>app mount');
	}, []);

	useEffect(() => {
		console.log('>>>> num change create');
		return () => {
			console.log('>>>> num change destroy');
		};
	}, [num]);

	return (
		<div
			onClick={() => {
				setNum(num + 1);
			}}
		>
			{(num & 1) === 0 ? <Child></Child> : null}
		</div>
	);
}

createRoot(document.getElementById('root')!).render(<App />);
