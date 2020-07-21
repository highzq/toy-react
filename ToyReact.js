

class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type);
    }
    setAttribute(name, value){
        if(name.match(/^on([\s\S]+)$/)){
            let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
            this.root.addEventListener(eventName, value);
        }
        if(name === "className"){
            name = "class";
        }
        this.root.setAttribute(name, value);        
    }
    appendChild(vchild){
        vchild.mounTo(this.root);
    }
    mounTo(parent){
        parent.appendChild(this.root);
    }
}

class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content);
    }
    mounTo(parent){
        parent.appendChild(this.root);
    }
}

export class Component {
    constructor(){
        this.children = [];
        this.props = Object.create(null);
    }
    setAttribute(name, value){
        if(name.match(/^on([\s\S]+)&/)){
            console.log(RegExp.$1);
        }
        this.props[name] = value;
        this[name] = value;
    }
    mounTo(range){
        this.range = range;
        this.update();
    }
    update(){
        let placeholder = document.createComment('plplaceholdera');
        let range = document.createRange();
        range.setStart(this.range.endContainer, this.range.endOffset);
        range.setEnd(this.range.endContainer, this.range.endOffset);
        range.insertNode(placeholder);

        this.range.deleteContents();

        let vdom = this.rander();
        vdom.mounTo(this.range);
    }
    appendChild(vchild){
        this.children.push(vchild);
    }
    setState(state){
        let merge = (oldState, newState) => {
            for(let p of newState){
                if(typeof newState[p] === "object"){
                    if(typeof oldState[p] !== "object"){
                        oldState = {};
                    }
                    merge(oldState[p], newState[p]);
                }else{
                    oldState[p] = newState[p];
                }
            }
        }
        if(!this.state && state){
            this.state = {};
        }
        merge(this.state, state);
        console.log(this.state);
    }
}

export let ToyReact = {
    /**
     * 编译jsx语法阶段调用的方法
     * @param {*} type 
     * @param {*} attributes 
     * @param  {...any} children 
     */
    createElement(type, attributes, ...children){
        //console.log(type, attributes, ...children, 666);
        let element;
        /**
         * type等于string代表是普通标签
         * 否则就是自定义组件类，那么就new 组件类实例
         */
        if(typeof type === "string"){
            element = new ElementWrapper(type);
        }else{
            element = new type;
        }
        /**
         * 设置标签属性
         */
        for(let name in attributes){
            element.setAttribute(name,attributes[name]);
        }
        /**
         * 递归标签内的子集元素方法
         * @param {} children 
         */
        let insertChildren = (children) => {            
            for(let child of children){
                if(typeof child === "object" && child instanceof Array){
                    insertChildren(child);
                }else{      
                    /**
                     * 判断child是否为 Component，ElementWrapper，TextWrapper 这些类的实例，都不是那就当字符串处理
                     * 一般都不是的都标签内的文本
                     */
                    if(
                        !(child instanceof Component)
                        && !(child instanceof ElementWrapper)
                        && !(child instanceof TextWrapper)
                    ){
                        child = String(child);
                    }
                    /**
                     * 类型为字符串就。。。
                     */
                    if(typeof child === "string"){
                        child = new TextWrapper(child);
                    }
                    
                    element.appendChild(child);
                }
            }
        }
        insertChildren(children);
        return element;
    },
    render(vdom, element){
        console.log(vdom)
        vdom.mounTo(element);        
    }

}