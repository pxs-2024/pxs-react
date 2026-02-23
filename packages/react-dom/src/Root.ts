import { Container } from 'HostConfig';
import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/FiberReconciler';
import { ReactElement } from 'shared/ReactTypes';
import { initEvent } from './SyntheticEvent';

export function createRoot(container: Container) {
	const root = createContainer(container);

	return {
		render(element: ReactElement) {
			initEvent(container, 'click');
			return updateContainer(element, root);
		}
	};
}
