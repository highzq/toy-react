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
    <span>1</span>
</MyComponent>

ToyReact.render(a,document.body);