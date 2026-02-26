import { FiberNode } from 'react-reconciler/src/Fiber';
import { HostComponent, HostText } from 'react-reconciler/src/WorkTag';
import { DomElement, updateFiberProps } from './SyntheticEvent';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = (type: string, props: any) => {
	// todo 处理props
	const element = document.createElement(type) as unknown;
	updateFiberProps(element as DomElement, props);
	return element as DomElement;
};

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendChildToContainer = (
	child: Instance | Container,
	parent: Container
) => {
	return parent.appendChild(child);
};

export const appendInitialChild = appendChildToContainer;

export const commitUpdate = (finishedWork: FiberNode) => {
	switch (finishedWork.tag) {
		case HostText:
			const text = finishedWork.memoizedProps.content;
			return commitTextUpdate(finishedWork.stateNode, text);
		case HostComponent:
			// updateFiberProps()
			// return
			return;
		default:
			if (__DEV__) {
				console.warn('未实现的Update类型');
			}
	}
};

const commitTextUpdate = (textInstance: TextInstance, content: string) => {
	textInstance.textContent = content;
};

export const removeChild = (
	child: Instance | TextInstance,
	parent: Instance | Container
) => {
	parent.removeChild(child);
};

export const insetChildToContainer = (
	child: Instance,
	container: Container,
	before: Instance
) => {
	container.insertBefore(child, before);
};
