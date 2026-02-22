import {
	appendInitialChild,
	createInstance,
	createTextInstance,
	Instance
} from 'HostConfig';
import { FiberNode } from './Fiber';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './WorkTag';
import { NoFlags } from './FiberFlags';

/**
 * completeWork 需要做什么
 * 对于Host类型的fiberNode:构建离屏dom树
 * 标记 Update flags
 *
 * 性能优化策略
 * flags分布在不同的fiberNode中，如何快速找到他们？
 * 利用complete向上便历的流程，将子fiberNode的flags冒泡到父fiberNode
 */

export const completeWork = (wip: FiberNode) => {
	// 递归中的归
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	switch (wip.tag) {
		case HostRoot:
			bubbleProperties(wip);
			return null;
		case HostComponent:
			if (current !== null && wip.stateNode) {
				//  update
			} else {
				// mount
				// 1.构建dom树
				const instance = createInstance(wip.type, newProps);
				// 2.将DOM插入到DOM树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				//  update
			} else {
				// mount
				// 1.构建dom树
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的complete类型');
			}
	}
};

function appendAllChildren(parent: Instance, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(node.stateNode, parent);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node === wip) {
			return;
		}
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
