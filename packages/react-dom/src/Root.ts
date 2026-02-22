import { Container } from 'HostConfig';
import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/FiberReconciler';
import { ReactElement } from 'shared/ReactTypes';

export function createRoot(container: Container) {
	const root = createContainer(container);

	return {
		render(element: ReactElement) {
			updateContainer(element, root);
		}
	};
}
