// T - Wrapped component props
// S - Wrapped component state
// K - Store state
// I - Injected props to wrapped component

declare module 'unistore/react' {
	import * as React from 'react';
	import { ActionCreator, StateMapper, Store } from 'unistore';

	export function connect<T, S, K, I>(
		mapStateToProps: string | Array<string> | StateMapper<T, K, I>,
		actions?: ActionCreator<K> | object
	): (
		Child: ((props: T & I) => React.ReactNode) | React.ComponentClass<T, S>
	) => React.ComponentClass<T, S>;

	export interface ProviderProps<T> {
		value: Store<T>;
	}

	export class Provider<T> extends React.Component<ProviderProps<T>, {}> {
		render(): React.ReactNode;
	}

	interface ComponentConstructor<P = {}, S = {}> {
		new (props: P, context?: any): React.Component<P, S>;
	}

	declare type EqualityFn = (a: any, b: any) => any;
	export type UseSelector<State, Selected> = (
		selector: (state: State) => Selected
	) => Selected;
	export declare const useSelector: <State, Selected>(
		selector: (state: State) => Selected,
		equalityFn?: EqualityFn
	) => Selected;

	export type TypedUseSelector<State> = <Selected>(
		selector: (state: State) => Selected
	) => Selected;

	export type UseAction = <State, Args extends any[]>(
		action: (
			state: State,
			...args: Args
		) => Promise<Partial<State>> | Partial<State> | void
	) => (...args: Args) => void;

	export declare const useAction: <State, Args extends any[]>(
		action: (
			state: State,
			...args: Args
		) => void | Partial<State> | Promise<Partial<State>>
	) => (...args: Args) => void;

	export type TypedUseAction<State> = <Args extends any[]>(
		action: (
			state: State,
			...args: Args
		) => Promise<Partial<State>> | Partial<State> | void
	) => (...args: Args) => void;

	export declare const useStore: () => Store<any>;
}
