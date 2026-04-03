import { lazy, Suspense, useState } from 'react';
import ClassComp from './Components/ClassComp';
import UseEffect from './Components/useEffect';
import Counter from './Components/Counter';
import UseRef from './Components/useRef';
import UseMemo from './Components/useMemo';
import UseMemoPractice from './Components/useMemoPractice';
import UseCallback from './Components/useCallback';   
// import Lazyloading from './Components/Lazyloading';  
const LazyloadingComponent = lazy(() => import("./Components/Lazyloading"));

export default function App() {
  let [show, setShow] = useState(false);

  return (
    <div>
      <h1>React Hooks</h1>


      <button onClick={() => setShow(!show)}>Toggle</button>
      {/* {show && <Lazyloading />} */}
      {show && <Suspense fallback={
        <div>Loading...</div>
      }>
        <LazyloadingComponent />
      </Suspense>}
      
    </div>
  );
}