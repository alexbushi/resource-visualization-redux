import configureStore from './store/configureStore';
import { loadResources } from './store/resources';
import { loginUser, getTimerInvervals } from './store/user';

const store = configureStore();

store.dispatch(loginUser());

setTimeout(() => {store.dispatch(getTimerInvervals())}, 1500);

setTimeout(() => {store.dispatch(loadResources())}, 1500);