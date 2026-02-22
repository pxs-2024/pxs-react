(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.client = factory());
})(this, (function () { 'use strict';

	const FunctionComponent = 0;
	const HostRoot = 3;
	const HostComponent = 5;
	const HostText = 6;

	const NoFlags = 0b00000000;
	const Placement = 0b0000001;
	const Update = 0b00000010;
	const ChildDeletion = 0b00000100;
	const MutationMask = Placement | Update | ChildDeletion;

	class FiberNode {
	    tag;
	    pendingProps;
	    key;
	    stateNode = null;
	    type = null;
	    // 构成树状结构
	    return = null;
	    sibling = null;
	    child = null;
	    index = 0;
	    ref = null;
	    // 作为工作单元
	    memoizedProps = null;
	    memoizedState = null;
	    alternate = null;
	    updateQueue = null;
	    // 副作用
	    flags = NoFlags;
	    subtreeFlags = NoFlags;
	    constructor(tag, pendingProps, key) {
	        this.tag = tag;
	        this.pendingProps = pendingProps;
	        this.key = key;
	    }
	}
	class FiberRootNode {
	    container;
	    finishedWork = null;
	    current;
	    constructor(container, hostRootFiber) {
	        this.container = container;
	        this.current = hostRootFiber;
	        hostRootFiber.stateNode = this;
	    }
	}
	const createWorkInProgress = (current, pendingProps) => {
	    let wip = current.alternate;
	    if (wip === null) {
	        // mount
	        // 创建 alternate
	        wip = new FiberNode(current.tag, pendingProps, current.key);
	        wip.stateNode = current.stateNode;
	        // 和current绑定
	        wip.alternate = current;
	        current.alternate = wip;
	    }
	    else {
	        // update
	        wip.pendingProps = pendingProps;
	        wip.flags = NoFlags;
	    }
	    wip.type = current.type;
	    wip.updateQueue = current.updateQueue;
	    wip.child = current.child;
	    wip.memoizedProps = current.memoizedProps;
	    wip.memoizedState = current.memoizedState;
	    return wip;
	};
	function createFiberFromElement(element) {
	    const { type, key, props } = element;
	    let fiberTag = FunctionComponent;
	    if (typeof type === 'string') {
	        fiberTag = HostComponent;
	    }
	    else if (typeof type !== 'function' && true) {
	        console.warn('未定义的type类型', element);
	    }
	    const fiber = new FiberNode(fiberTag, props, key);
	    fiber.type = type;
	    return fiber;
	}

	// 创建update
	const createUpdate = (action) => {
	    return {
	        action
	    };
	};
	// 创建updateQueue
	const createUpdateQueue = () => {
	    return {
	        // 为什么及哦啊shared 因为被current和workingProgress 共同使用
	        shared: {
	            pending: null
	        }
	    };
	};
	// 插入update
	const enqueueUpdate = (updateQueue, update) => {
	    updateQueue.shared.pending = update;
	};
	// 消费update
	const processUpdateQueue = (baseState, pendingUpdate) => {
	    const result = {
	        memoizedState: baseState
	    };
	    if (pendingUpdate !== null) {
	        const action = pendingUpdate.action;
	        if (action instanceof Function) {
	            // baseState 1 update 2 -> memoizedState 2
	            result.memoizedState = action(baseState);
	        }
	        else {
	            // baseState 1 update （x）-> 4x -> memoizedState 4
	            result.memoizedState = action;
	        }
	    }
	    return result;
	};

	const supportSymbol = typeof Symbol === 'function' && Symbol.for;
	const REACT_ELEMENT_TYPE = supportSymbol
	    ? Symbol.for('react.element')
	    : 0xeac7;

	/**
	 *
	 * @param shouldTrackEffects 是否需要追踪副作用。false则不标记flag；
	 */
	function childReconciler(shouldTrackEffects) {
	    function reconcileSingleElement(returnFiber, currentFiber, element) {
	        // 根据element创建fiber
	        const fiber = createFiberFromElement(element);
	        fiber.return = returnFiber;
	        return fiber;
	    }
	    function reconcileSingleTextNode(returnFiber, currentFiber, content) {
	        const fiber = new FiberNode(HostText, { content }, null);
	        fiber.return = returnFiber;
	        return fiber;
	    }
	    function placeSingleChild(fiber) {
	        if (shouldTrackEffects && fiber.alternate === null) {
	            fiber.flags |= Placement;
	        }
	        return fiber;
	    }
	    return function reconcileChildFibers(returnFiber, currentFiber, newChild) {
	        // 判断当前fiber的类型
	        if (typeof newChild === 'object' && newChild !== null) {
	            switch (newChild.$$typeof) {
	                case REACT_ELEMENT_TYPE:
	                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFiber, newChild));
	                default:
	                    {
	                        console.warn('未实现的reconcile类型');
	                    }
	                    break;
	            }
	        }
	        // TODO 多节点的情况
	        // hostText
	        if (typeof newChild === 'string' || typeof newChild === 'number') {
	            return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFiber, newChild));
	        }
	        {
	            console.warn('未实现的reconcile类型');
	        }
	        return null;
	    };
	}
	const reconcileChildFibers = childReconciler(true);
	const mountChildFibers = childReconciler(false);

	// 递归中的递
	// 过程中可能标记的flags 结构变化 Placement ChildDeletion
	// 不标记的 属性相关 flags
	const beginWork = (wip) => {
	    // 比较，返回子fiberNode  子FiberNode
	    switch (wip.tag) {
	        case HostRoot:
	            return updateHostRoot(wip);
	        case HostComponent:
	            return updateHostComponent(wip);
	        case HostText:
	            // 没有子节点
	            return null;
	        default:
	            {
	                console.warn('beginWork未实现的类型');
	            }
	    }
	    return null;
	};
	function updateHostRoot(wip) {
	    const baseState = wip.memoizedState;
	    const updateQueue = wip.updateQueue;
	    const pending = updateQueue.shared.pending;
	    updateQueue.shared.pending = null;
	    const { memoizedState } = processUpdateQueue(baseState, pending);
	    wip.memoizedState = memoizedState;
	    const nextChildren = wip.memoizedState;
	    reconcileChildren(wip, nextChildren);
	    return wip.child;
	}
	function updateHostComponent(wip) {
	    const nextProps = wip.pendingProps;
	    const nextChildren = nextProps.children;
	    reconcileChildren(wip, nextChildren);
	    return wip.child;
	}
	function reconcileChildren(wip, children) {
	    const current = wip.alternate;
	    if (current !== null) {
	        // update
	        wip.child = reconcileChildFibers(wip, current?.child, children);
	    }
	    else {
	        // mount
	        wip.child = mountChildFibers(wip, null, children);
	    }
	}

	const createInstance = (type, props) => {
	    // todo 处理props
	    return document.createElement(type);
	};
	const createTextInstance = (content) => {
	    return document.createTextNode(content);
	};
	const appendChildToContainer = (child, parent) => {
	    return parent.appendChild(child);
	};
	const appendInitialChild = appendChildToContainer;

	let nextEffect;
	function commitMutationEffects(finishedWork) {
	    nextEffect = finishedWork;
	    while (nextEffect !== null) {
	        // 向下便历
	        const child = nextEffect.child;
	        if ((nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
	            child !== null) {
	            nextEffect = child;
	        }
	        else {
	            up: while (nextEffect !== null) {
	                commitMutationEffectsOnFiber(nextEffect);
	                const sibling = nextEffect.sibling;
	                if (sibling !== null) {
	                    nextEffect = sibling;
	                    break up;
	                }
	                nextEffect = nextEffect.return;
	            }
	        }
	    }
	}
	function commitMutationEffectsOnFiber(finishedWork) {
	    const flags = finishedWork.flags;
	    if ((flags & Placement) !== NoFlags) {
	        commitPlacement(finishedWork);
	        finishedWork.flags &= ~Placement;
	    }
	}
	const commitPlacement = (finishedWork) => {
	    {
	        console.warn('执行Placement', finishedWork);
	    }
	    // parent DOM
	    const hostParent = getHostParent(finishedWork);
	    // finishedWork DOM dom->append parent dom;
	    if (hostParent !== null) {
	        appendPlacementNodeIntoContainer(finishedWork, hostParent);
	    }
	};
	function getHostParent(fiber) {
	    let parent = fiber.return;
	    while (parent) {
	        const parentTag = parent.tag;
	        if (parentTag === HostComponent) {
	            return parent.stateNode;
	        }
	        if (parentTag === HostRoot) {
	            return parent.stateNode.container;
	        }
	        parent = parent.return;
	    }
	    {
	        console.warn('未找到hostParent');
	    }
	    return null;
	}
	function appendPlacementNodeIntoContainer(finishedWork, hostParent) {
	    // 找到host类型的fiber
	    if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
	        appendChildToContainer(finishedWork.stateNode, hostParent);
	        return;
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

	/**
	 * completeWork 需要做什么
	 * 对于Host类型的fiberNode:构建离屏dom树
	 * 标记 Update flags
	 *
	 * 性能优化策略
	 * flags分布在不同的fiberNode中，如何快速找到他们？
	 * 利用complete向上便历的流程，将子fiberNode的flags冒泡到父fiberNode
	 */
	const completeWork = (wip) => {
	    // 递归中的归
	    const newProps = wip.pendingProps;
	    const current = wip.alternate;
	    switch (wip.tag) {
	        case HostRoot:
	            bubbleProperties(wip);
	            return null;
	        case HostComponent:
	            if (current !== null && wip.stateNode) ;
	            else {
	                // mount
	                // 1.构建dom树
	                const instance = createInstance(wip.type);
	                // 2.将DOM插入到DOM树中
	                appendAllChildren(instance, wip);
	                wip.stateNode = instance;
	            }
	            bubbleProperties(wip);
	            return null;
	        case HostText:
	            if (current !== null && wip.stateNode) ;
	            else {
	                // mount
	                // 1.构建dom树
	                const instance = createTextInstance(newProps.content);
	                wip.stateNode = instance;
	            }
	            bubbleProperties(wip);
	            return null;
	        default:
	            {
	                console.warn('未处理的complete类型');
	            }
	    }
	};
	function appendAllChildren(parent, wip) {
	    let node = wip.child;
	    while (node !== null) {
	        if (node.tag === HostComponent || node.tag === HostText) {
	            appendInitialChild(node.stateNode, parent);
	        }
	        else if (node.child !== null) {
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
	function bubbleProperties(wip) {
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

	let workInProgress = null;
	function prepareFreshStack(root) {
	    workInProgress = createWorkInProgress(root.current, {});
	}
	function scheduleUpdateOnFiber(fiber) {
	    // todo 调度功能
	    const root = markUpdateFromFiberToRoot(fiber);
	    renderRoot(root);
	}
	function markUpdateFromFiberToRoot(fiber) {
	    let node = fiber;
	    let parent = node.return;
	    while (parent !== null) {
	        node = parent;
	        parent = node.return;
	    }
	    if (node.tag === HostRoot) {
	        return node.stateNode;
	    }
	    return null;
	}
	function renderRoot(root) {
	    // 初始化
	    prepareFreshStack(root);
	    do {
	        try {
	            workLoop();
	            break;
	        }
	        catch (e) {
	            workInProgress = null;
	            console.warn('workLoop发生错误', e);
	        }
	    } while (true);
	    const finishedWork = root.current.alternate;
	    root.finishedWork = finishedWork;
	    // wip fiberNode树中的flags。完成commit操作
	    commitRoot(root);
	}
	function commitRoot(root) {
	    const finishedWork = root.finishedWork;
	    if (finishedWork === null) {
	        return;
	    }
	    {
	        console.warn('commit阶段开始', finishedWork);
	    }
	    // 重置操作
	    root.finishedWork = null;
	    // 判断3个子阶段需要执行的操作
	    const subtreeHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
	    if (subtreeHasEffect || rootHasEffect) {
	        // beforeMutation
	        // mutation placement
	        commitMutationEffects(finishedWork);
	        root.current = finishedWork;
	        // layout
	    }
	    else {
	        root.current = finishedWork;
	    }
	}
	function workLoop() {
	    while (workInProgress !== null) {
	        performUnitOfWork(workInProgress);
	    }
	}
	function performUnitOfWork(fiber) {
	    const next = beginWork(fiber);
	    fiber.memoizedProps = fiber.pendingProps;
	    if (next === null) {
	        completeUnitOfWork(fiber);
	    }
	    else {
	        workInProgress = next;
	    }
	}
	function completeUnitOfWork(fiber) {
	    let node = fiber;
	    do {
	        completeWork(node);
	        const sibling = node.sibling;
	        if (sibling !== null) {
	            workInProgress = sibling;
	            return;
	        }
	        node = node.return;
	        workInProgress = node;
	    } while (node !== null);
	}

	// createRoot时调用
	function createContainer(container) {
	    const hostRootFiber = new FiberNode(HostRoot, {}, null);
	    const root = new FiberRootNode(container, hostRootFiber);
	    hostRootFiber.updateQueue = createUpdateQueue();
	    return root;
	}
	// root.render(<App>)（render时会调用）
	function updateContainer(element, root) {
	    const hostRootFiber = root.current;
	    const update = createUpdate(element);
	    enqueueUpdate(hostRootFiber.updateQueue, update);
	    scheduleUpdateOnFiber(hostRootFiber);
	    return element;
	}

	function createRoot(container) {
	    const root = createContainer(container);
	    return {
	        render(element) {
	            updateContainer(element, root);
	        }
	    };
	}

	var ReactDOM = /*#__PURE__*/Object.freeze({
		__proto__: null,
		createRoot: createRoot
	});

	return ReactDOM;

}));
