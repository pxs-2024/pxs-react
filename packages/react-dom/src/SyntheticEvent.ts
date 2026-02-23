import { Container } from 'HostConfig';
import { Props } from 'shared/ReactTypes';

export const elementPropsKey = '__props';
const validEventTypeList = ['click'];

type EventCallback = (e: Event) => void;

interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}

interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}

export interface DomElement extends Element {
	[elementPropsKey]: Props;
}

export const updateFiberProps = (node: DomElement, props: Props) => {
	node[elementPropsKey] = props;
};

export function initEvent(container: Container, eventType: string) {
	if (!validEventTypeList.includes(eventType)) {
		console.warn('未支持的事件类型', eventType);
	}
	if (__DEV__) {
		console.log('事件初始化', eventType);
	}
	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
	const targetElement = e.target as DomElement;
	if (targetElement === null) {
		console.warn('事件不存在target', e);
		return;
	}
	// 1.收集沿途的事件

	const { bubble, capture } = collectPaths(container, targetElement, eventType);
	// 2.构造合成事件
	const se = createSyntheticEvent(e);
	// 3.便历capture
	triggerEventFlow(capture, se);
	if (se.__stopPropagation) {
		return;
	}
	// 4.便历bubble
	triggerEventFlow(bubble, se);
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		callback.call(null, se);
		if (se.__stopPropagation) {
			break;
		}
	}
}

function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;

	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};
	return syntheticEvent;
}

function getEventCallbackNameFromEventType(eventType: string) {
	switch (eventType) {
		case 'click':
			return ['onClickCapture', 'onClick'];
	}
	return [] as unknown as [string, string];
}

function collectPaths(
	container: Container,
	targetElement: DomElement,
	eventType: string
) {
	const paths: Paths = {
		capture: [],
		bubble: []
	};
	while (targetElement && targetElement !== container) {
		// 收集
		const elementProps = targetElement[elementPropsKey];
		if (elementProps) {
			//
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				callbackNameList.forEach((callbackName, i) => {
					const eventCallback = elementProps[callbackName];
					if (eventCallback) {
						if (i === 0) {
							paths.capture.unshift(eventCallback);
						} else {
							paths.bubble.push(eventCallback);
						}
					}
				});
			}
		}

		targetElement = targetElement.parentNode as DomElement;
	}
	return paths;
}
