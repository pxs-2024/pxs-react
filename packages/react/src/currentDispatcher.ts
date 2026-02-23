import { Action } from 'shared/ReactTypes';

export interface Dispatcher {
	useState: <T>(initialState: () => T | T) => [T, Dispatch<T>];
	// useEffect: any;
}

export type Dispatch<State> = (action: Action<State>) => void;

const currentDisPatcher: { current: Dispatcher | null } = {
	current: null
};

export const resolveDispatcher = (): Dispatcher => {
	const dispatcher = currentDisPatcher.current;
	if (dispatcher === null) {
		throw Error('hook只能在函数组件中执行');
	}
	return dispatcher;
};

export default currentDisPatcher;
