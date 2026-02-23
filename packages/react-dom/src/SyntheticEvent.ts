import { Props } from 'shared/ReactTypes';

export const elementPropsKey = '__props';

export interface DomElement extends Element {
	[elementPropsKey]: Props;
}

export const updateFiberProps = (node: DomElement, props: Props) => {
	node[elementPropsKey] = props;
};

const vaildEv
