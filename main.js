import {ToyReact, Component} from './ToyReact.js';

class MyComponent extends Component{
    render(){
        return <div>
            <span>hello</span>
            <span>world!</span>
            <div>
                {true}
                {this.children}
            </div>
        </div>
    }
}

let a = <MyComponent name="a" id="gao">
    <p>1</p>
    <p>123<span>1</span></p>
</MyComponent>

ToyReact.render(a,document.body); 