
'use client';

import React from 'react';
import { useState } from 'react';

// Sample component with HTML entities and other issues
function MyComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Hello &amp; Welcome!</h1>
      <p>This is a &quot;test&quot; component with &lt;HTML&gt; entities.</p>
      <p>Price: &#36;99.99 &euro;85.50</p>
      <p>Copyright &copy; 2024 &ndash; All rights reserved.</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count} &nbsp; Click me!
      </button>
      <div>
        Special chars: &sect; &para; &bull; &deg; &trade;
      </div>
    </div>
  );
}

export default MyComponent;
