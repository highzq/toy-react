import {ToyReact, Component} from './ToyReact.js';
class Square extends Component{
    render (){
        return (
            <button className="square" onClick={()=> this.setState({value:'x'})}>
                {this.props.value}
            </button>
        );
    }
}
class Board extends Component{
    renderSquare(i){
        return <Square value={i} />;
    }
    render(){
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(6)}
                </div>
                <div className="board-row">
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                    {this.renderSquare(9)}
                </div>                                
            </div>
        )
    }
}

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

ToyReact.render(<Board />,document.body); 