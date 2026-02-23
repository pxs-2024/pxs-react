import { ReactElement } from 'react';
// @ts-ignore
import { createRoot } from 'react-dom';

export function renderInInToDocument(element: ReactElement) {
	const div = document.createElement('div');
	return createRoot(div).render(element);
}
