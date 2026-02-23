import currentDisPatcher, {
	Dispatcher,
	resolveDispatcher
} from './src/currentDispatcher';
import { jsx, jsxDEV, isValidElement as isValidElementFn } from './src/jsx';

export const useState: Dispatcher['useState'] = (initialValue: any) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialValue);
};

export const _SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDisPatcher
};

export const version = '0.0.0';
// TODO 根据环境区分使用jsx/jsxDev
export const createElement = jsxDEV;

export const isValidElement = isValidElementFn;
