import {
	createContext,
	useContext,
	useEffect,
	useReducer,
	useRef,
	createElement,
	Component
} from 'react';
import { assign, mapActions, select } from '../util';

const UnistoreContext = createContext(null);

export const useStore = () => {
	const store = useContext(UnistoreContext);
	if (!store) {
		throw new Error("Missing context. Ensure you've rendered a Provider.");
	}
	return store;
};

/** Wire a component up to the store. Passes state as props, re-renders on change.
 *  @param {Function|Array|String} mapStateToProps  A function mapping of store state to prop values, or an array/CSV of properties to map.
 *  @param {Function|Object} [actions] 				Action functions (pure state mappings), or a factory returning them. Every action function gets current state as the first parameter and any other params next
 *  @returns {Component} ConnectedComponent
 *  @example
 *    const Foo = connect('foo,bar')( ({ foo, bar }) => <div /> )
 *  @example
 *    const actions = { someAction }
 *    const Foo = connect('foo,bar', actions)( ({ foo, bar, someAction }) => <div /> )
 *  @example
 *    @connect( state => ({ foo: state.foo, bar: state.bar }) )
 *    export class Foo { render({ foo, bar }) { } }
 */

export function connect(mapStateToProps, actions) {
	if (typeof mapStateToProps !== 'function') {
		mapStateToProps = select(mapStateToProps || []);
	}
	return Child => {
		function Wrapper(props, context) {
			Component.call(this, props, context);
			const store = context;
			let state = mapStateToProps(store ? store.getState() : {}, props);
			const boundActions = actions ? mapActions(actions, store) : { store };
			const update = () => {
				const mapped = mapStateToProps(store ? store.getState() : {}, props);
				for (const i in mapped) {
					if (mapped[i] !== state[i]) {
						state = mapped;
						return this.forceUpdate();
					}
				}
				for (const i in state) {
					if (!(i in mapped)) {
						state = mapped;
						return this.forceUpdate();
					}
				}
			};
			this.componentWillReceiveProps = p => {
				props = p;
				update();
			};
			this.componentDidMount = () => {
				store.subscribe(update);
			};
			this.componentWillUnmount = () => {
				store.unsubscribe(update);
			};
			this.render = () =>
				createElement(
					Child,
					assign(assign(assign({}, boundActions), this.props), state)
				);
		}
		Wrapper.contextType = UnistoreContext;
		return ((Wrapper.prototype = Object.create(
			Component.prototype
		)).constructor = Wrapper);
	};
}

/** Provider exposes a store (passed as `props.value`) into context.
 *
 *  Generally, an entire application is wrapped in a single `<Provider>` at the root.
 *  @class
 *  @extends Component
 *  @param {Object} props
 *  @param {Store} props.value		A {Store} instance to expose via context.
 */
export function Provider({ store, value, children }) {
	return createElement(
		UnistoreContext.Provider,
		{ value: value || store },
		children
	);
}

export const useAction = action => useStore().action(action);

export const useSelector = (selector, equalityFn) => {
	const store = useStore();

	// Allow store subscriptions to force render updates
	// https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	const resultRef = useRef(null);

	resultRef.current = selector(store.getState());

	useEffect(() => {
		const listener = state => {
			const result = selector(state);
			if (
				equalityFn
					? !equalityFn(resultRef.current, result)
					: resultRef.current !== result
			) {
				forceUpdate({});
			}
		};
		store.subscribe(listener);
		return () => {
			store.unsubscribe(listener);
		};
	}, []);

	return resultRef.current;
};
