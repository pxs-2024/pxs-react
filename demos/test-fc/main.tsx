import { createRoot } from 'react-dom/client';
import { useState } from 'react';

function App() {
	const [num, setNum] = useState(0);
	return <div onClick={() => setNum(num + 1)}>{num}</div>;
}

createRoot(document.getElementById('root')!).render(<App />);
