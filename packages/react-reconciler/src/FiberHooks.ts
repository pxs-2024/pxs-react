import { FiberNode } from './Fiber';

export function renderWithHooks(wip: FiberNode) {
	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);
	return children;
}
