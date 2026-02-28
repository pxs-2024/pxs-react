import { Container } from 'HostConfig';
import { FiberNode, FiberRootNode } from './Fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './UpdateQueue';
import { HostRoot } from './WorkTag';
import { ReactElement } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './WorkLoop';
import { requestUpdateLane } from './FiberLane';

// createRoot时调用
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

// root.render(<App>)（render时会调用）
export function updateContainer(
	element: ReactElement | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const lane = requestUpdateLane();
	const update = createUpdate<ReactElement | null>(element, lane);
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElement | null>,
		update
	);
	scheduleUpdateOnFiber(hostRootFiber, lane);
	return element;
}
