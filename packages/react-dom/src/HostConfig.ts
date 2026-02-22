export type Container = Element;
export type Instance = Element;

export const createInstance = (type: string, props: any) => {
	// todo 处理props
	return document.createElement(type);
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
