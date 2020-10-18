import configureStore from './store/configureStore';
import { loadResources } from './store/resources';

const store = configureStore();

store.dispatch(loadResources());