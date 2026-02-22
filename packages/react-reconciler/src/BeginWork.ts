// 递归中的递
// 过程中可能标记的flags 结构变化 Placement ChildDeletion
// 不标记的 属性相关 flags

import { ReactElement } from 'shared/ReactTypes';
import { FiberNode } from './Fiber';
import { processUpdateQueue, Update, UpdateQueue } from './UpdateQueue';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './WorkTag';
import { mountChildFibers, reconcileChildFibers } from './ChildFibers';
import { renderWithHooks } from './FiberHooks';

export const beginWork = (wip: FiberNode) => {
	// 比较，返回子fiberNode  子FiberNode
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);

		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			// 没有子节点
			return null;
		case FunctionComponent:
			return updateFunctionComponent(wip);
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
	}
	return null;
};

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip);
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElement) {
	const current = wip.alternate;
	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
