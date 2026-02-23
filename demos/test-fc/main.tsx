import { createRoot } from 'react-dom/client';
import { useState } from 'react';

function App() {
	const [num, setNum] = useState(0);
	window.setNum = setNum;
	if (num === 3) {
		return <div>hahah</div>;
	} else {
		return num;
	}
}

createRoot(document.getElementById('root')!).render(<App />);
