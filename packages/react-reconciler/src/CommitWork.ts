import {
	appendChildToContainer,
	commitUpdate,
	Container,
	insetChildToContainer,
	Instance,
	removeChild
} from 'HostConfig';
import { FiberNode, FiberRootNode } from './Fiber';
import {
	ChildDeletion,
	MutationMask,
	NoFlags,
	Placement,
	Update
} from './FiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './WorkTag';

let nextEffect: FiberNode | null;

export function commitMutationEffects(finishedWork: FiberNode) {
	nextEffect = finishedWork;
	while (nextEffect !== null) {
		// 向下便历
		const child: FiberNode | null = nextEffect.child;
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
}

function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}
	if ((flags & Update) !== NoFlags) {
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Update;
	}
	if ((flags & ChildDeletion) !== NoFlags) {
		const deletions = finishedWork.deletions;
		if (deletions !== null) {
			deletions.forEach((childToDelete) => {
				commitDeletion(childToDelete);
			});
		}
		finishedWork.flags &= ~ChildDeletion;
	}
}

function recordHostChildrenToDelete(
	childrenToDelete: FiberNode[],
	umountFiber: FiberNode
) {
	// 1.找到第一个root host节点
	const lastOne = childrenToDelete[childrenToDelete.length - 1];
	// 2.每找到一个host节点，判断下这个节点是不是 1 找到那个节点的兄弟节点
	if (!lastOne) {
		childrenToDelete.push(umountFiber);
	} else {
		let node = lastOne.sibling;
		while (node !== null) {
			if (umountFiber === node) {
				childrenToDelete.push(umountFiber);
			}
			node = node.sibling;
		}
	}
}

function commitDeletion(childToDelete: FiberNode) {
	const rootChildrenTODelete: FiberNode[] = [];
	// 递归子树
	commitNestedComponent(childToDelete, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case HostComponent:
				recordHostChildrenToDelete(rootChildrenTODelete, unmountFiber);
				//todo 解绑ref
				return;
			case HostText:
				recordHostChildrenToDelete(rootChildrenTODelete, unmountFiber);
				return;
			case FunctionComponent:
				// todo useEffect unmount
				return;
			default:
				console.warn('未实现的unmount类型', unmountFiber);
		}
	});
	// 移除rootHostComponent的dom
	if (rootChildrenTODelete.length) {
		const hostParent = getHostParent(childToDelete);
		if (hostParent !== null) {
			rootChildrenTODelete.forEach((node) => {
				removeChild(node.stateNode, hostParent);
			});
		}
	}
	childToDelete.return = null;
	childToDelete.child = null;
}

function commitNestedComponent(
	root: FiberNode,
	onCommitUnmount: (fiber: FiberNode) => void
) {
	let node = root;
	while (true) {
		onCommitUnmount(node);
		if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node === root) {
			return;
		}
		while (node.sibling === null) {
			if (node.return === null || node.return === root) {
				return;
			}
			node = node.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行Placement', finishedWork);
	}
	// parent DOM
	const hostParent = getHostParent(finishedWork);

	// 找到对应 host sibling
	const sibling = getHostSibling(finishedWork);
	// finishedWork DOM dom->append parent dom;
	if (hostParent !== null) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent, sibling);
	}
};

const getHostSibling = (fiber: FiberNode) => {
	let node: FiberNode = fiber;
	findSibling: while (true) {
		while (node.sibling === null) {
			const parent = node.return;

			if (
				parent === null ||
				parent.tag === HostComponent ||
				parent.tag === HostRoot
			) {
				return;
			}
			node = parent;
		}

		node.sibling.return = node.return;
		node = node.sibling;
		while (node.tag !== HostText && node.tag !== HostComponent) {
			// 向下便历
			if ((node.flags & Placement) !== NoFlags) {
				continue findSibling;
			}
			if (node.child === null) {
				continue findSibling;
			} else {
				node.child.return = node;
				node = node.child;
			}
		}
		if ((node.flags & Placement) === NoFlags) {
			return node.stateNode;
		}
	}
};

function getHostParent(fiber: FiberNode): Container | null {
	let parent = fiber.return;
	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}
	if (__DEV__) {
		console.warn('未找到hostParent');
	}
	return null;
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container,
	before?: Instance
) {
	// 找到host类型的fiber
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		if (before) {
			insetChildToContainer(finishedWork.stateNode, hostParent, before);
		} else {
			appendChildToContainer(finishedWork.stateNode, hostParent);
			return;
		}
	}
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child?.sibling;
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
