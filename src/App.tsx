import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import ProductBundleManager from './components/ProductBundleManager';
import './App.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Provider store={store}>
        <div className="App">
          <header className="App-header">
            <h1>Monk Commerce</h1>
          </header>
          <main>
            <ProductBundleManager />
          </main>
        </div>
      </Provider>
    </DndProvider>
  );
}

export default App;
