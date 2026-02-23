import type { Props, Key, Ref, ReactElement } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './WorkTag';
import { Flags, NoFlags } from './FiberFlags';
import { Container } from 'HostConfig';
import { UpdateQueue } from './UpdateQueue';

export class FiberNode {
	stateNode: any = null;
	type: any = null;

	// 构成树状结构
	return: FiberNode | null = null;
	sibling: FiberNode | null = null;
	child: FiberNode | null = null;
	index: number = 0;

	ref: Ref = null;

	// 作为工作单元
	memoizedProps: Props = null;
	memoizedState: any = null;
	alternate: FiberNode | null = null;

	// 副作用
	flags: Flags = NoFlags;
	subtreeFlags: Flags = NoFlags;
	updateQueue: unknown = null;
	deletions: FiberNode[] | null = null;

	constructor(
		public tag: WorkTag,
		public pendingProps: Props,
		public key: Key
	) {}
}

export class FiberRootNode {
	finishedWork: FiberNode | null = null;
	current: FiberNode;
	constructor(
		public container: Container,
		hostRootFiber: FiberNode
	) {
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		// 创建 alternate
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;
		// 和current绑定
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.deletions = null;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;
	return wip;
};

export function createFiberFromElement(element: ReactElement): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
