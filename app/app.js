/**
 * Created by admin on 2016/12/17.
 */

import React from 'react';
import {render} from 'react-dom';
import AppComponent from './components/productBox';

class App extends React.Component{
    render(){
       return( <AppComponent />);
    }
}

render(<App/>, document.getElementById('content'));